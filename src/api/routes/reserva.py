from flask import Blueprint, request, jsonify, redirect
from api.models import db, Reserva, Usuario, Cancha, Club
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
import json
from api.extra.horario import validar_hora, calcular_intervalos, FRECUENCIAS_PERMITIDAS, DIAS_PERMITIDOS
import stripe
import os

reserva_bp = Blueprint('reserva_bp', __name__, url_prefix='/reserva')
stripe.api_key = os.getenv('STRIPE_API_KEY')

#---------------------------------------------------------------------------------------------------------------
# Función interna para crear reservas (reutilizable)
def crear_reserva_interna(data, stripe_payment_id=None):
    # Validación de campos requeridos
    required_fields = ['fecha', 'horaInicio', 'horaFin', 'idCancha', 'estado', 'metodoPago', 'monto']
    empty_fields = [field for field in required_fields if not data.get(field)]
    if empty_fields:
        return jsonify({'msg': 'Campos vacíos o faltantes', 'Campos Vacios o Faltantes': empty_fields}), 400

    # Verificar rol Deportista
    jwt_data = get_jwt()
    if "Deportista" not in jwt_data.get("roles", []):
        return jsonify({"error": "El usuario no tiene el rol Deportista"}), 401

    # Validar usuario
    usuario = Usuario.query.filter_by(nombreUsuario=get_jwt_identity()).first()
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Validar cancha
    cancha = Cancha.query.get(data['idCancha'])
    if not cancha:
        return jsonify({"error": "Cancha no encontrada"}), 404

    # Validar fecha
    try:
        fecha_dt = datetime.strptime(data['fecha'], "%d/%m/%Y").date()
        if fecha_dt < datetime.now().date():
            return jsonify({'error': 'La fecha no puede ser anterior a hoy'}), 400
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido (dd/mm/aaaa)'}), 400

    # Validar día de la semana
    dias_semana = {
        0: "Lunes", 1: "Martes", 2: "Miercoles",
        3: "Jueves", 4: "Viernes", 5: "Sabado", 6: "Domingo"
    }
    dia_reserva = dias_semana[fecha_dt.weekday()]
    dias_disp = [d.strip().lower() for d in cancha.horario.diasDisponibles.split(',')] if cancha.horario.diasDisponibles else []
    
    if dia_reserva.lower() not in dias_disp:
        return jsonify({'error': f'Día no disponible: {dia_reserva}'}), 400

    # Validar horas
    def parse_hora(h):
        for fmt in ("%H:%M:%S", "%H:%M"):
            try:
                return datetime.strptime(h, fmt).time().replace(second=0, microsecond=0)
            except ValueError:
                pass
        return None

    hora_inicio = parse_hora(data['horaInicio'])
    hora_fin = parse_hora(data['horaFin'])
    
    if not hora_inicio or not hora_fin:
        return jsonify({'error': 'Formato de hora inválido (HH:MM o HH:MM:SS)'}), 400

    # Validar disponibilidad de horario
    reservas_existentes = Reserva.query.filter(
        Reserva.idCancha == data['idCancha'],
        Reserva.fecha == fecha_dt,
        (Reserva.horaInicio < hora_fin) & (Reserva.horaFin > hora_inicio)
    ).all()
    
    if reservas_existentes:
        return jsonify({"error": "Horario ya reservado"}), 400

    # Validar horario de la cancha
    hi_sched = cancha.horario.horarioInicio
    hf_sched = cancha.horario.horarioFin
    if hora_inicio < hi_sched or hora_fin > hf_sched:
        return jsonify({'error': f'Horario válido: {hi_sched.strftime("%H:%M")} a {hf_sched.strftime("%H:%M")}'}), 400

    # Validar frecuencia
    freq = cancha.horario.frecuencia.lower()
    if freq == '1h' and (hora_inicio.minute != 0 or hora_fin.minute != 0):
        return jsonify({'error': 'Con frecuencia 1h, minutos deben ser 00'}), 400
    elif freq == '30m' and (hora_inicio.minute not in (0,30) or hora_fin.minute not in (0,30)):
        return jsonify({'error': 'Con frecuencia 30m, minutos deben ser 00 o 30'}), 400

    # Validar monto
    try:
        monto = float(data['monto'])
        if monto <= 0:
            return jsonify({'error': 'Monto debe ser mayor a 0'}), 400
    except ValueError:
        return jsonify({'error': 'Monto inválido'}), 400

    # Validar estado y método de pago
    if data['estado'] not in ['Pendiente', 'Confirmada', 'Cancelada']:
        return jsonify({'error': 'Estado de reserva inválido'}), 400
    
    if data['metodoPago'] not in ['Efectivo', 'Tarjeta de credito', 'Transferencia', 'Tarjeta de debito']:
        return jsonify({'error': 'Método de pago inválido'}), 400

    # Crear reserva
    nueva_reserva = Reserva(
        fecha=fecha_dt,
        horaInicio=hora_inicio,
        horaFin=hora_fin,
        idCancha=data['idCancha'],
        idUsuario=usuario.idUsuario,
        estado=data['estado'],
        metodoPago=data['metodoPago'],
        monto=monto,
        stripe_payment_id=stripe_payment_id
    )

    db.session.add(nueva_reserva)
    db.session.commit()

    return jsonify({"message": "Reserva creada exitosamente", "reserva": nueva_reserva.serialize()}), 201

#---------------------------------------------------------------------------------------------------------------
# Endpoints principales para Stripe

@reserva_bp.route('/crear', methods=['POST'])
@jwt_required()
def crear_reserva():
    return crear_reserva_interna(request.get_json())

@reserva_bp.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    try:
        data = request.get_json()
        required_fields = ['idCancha', 'monto', 'fecha', 'frecuencia', 'slots', 'nombreCancha']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Datos incompletos"}), 400
        
        email_usuario = Usuario.query.filter_by(nombreUsuario=get_jwt_identity()).first().email
        if not email_usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        cancha = Cancha.query.get(data['idCancha'])
        if not cancha:
            return jsonify({"error": "Cancha no encontrada"}), 404
        
        club = Club.query.get(cancha.idClub)
        if not club:
            return jsonify({"error": "Club no encontrado"}), 404
        
        # Convertir slots en rangos completos tipo "14:00 - 15:00"
        slots_rango = []
        frecuencia = data['frecuencia']
        for index,slot in enumerate(data['slots'], start=1):
            hora_inicio = datetime.strptime(slot, "%H:%M")
            if frecuencia == 60:
                hora_fin = hora_inicio + timedelta(hours=1)
            elif frecuencia == 30:
                hora_fin = hora_inicio + timedelta(minutes=30)
            else:
                return jsonify({'error': 'Frecuencia inválida'}), 400
            slots_rango.append(f" {index} - [ {hora_inicio.strftime('%H:%M')} - {hora_fin.strftime('%H:%M')} ]")


        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            customer_email=email_usuario,
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': "Reserva de : [ " + data['nombreCancha'] + " ] en " + club.nombre,
                                     'images': [cancha.imagen] if cancha.imagen else [], 
                                     'description': (
                                                    f"📅 {data['fecha']} | ⏰ {', '.join(slots_rango)} "
                                    ),},
                    'unit_amount': int(float(data['monto']) * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url  = f"{os.getenv('FRONTEND_URL')}/reserva-exitosa?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url   = f"{os.getenv('FRONTEND_URL')}/reservar-cancelado",
            metadata     = {
                'user':       get_jwt_identity(),
                'idCancha':   str(data['idCancha']),
                'fecha':      data['fecha'],
                'slots':      json.dumps(data['slots']),      
                'frecuencia': str(data['frecuencia']),   
                'monto':      str(data['monto']),
                'estado':     'Confirmada',
                'metodoPago': 'Tarjeta de credito'
            }
        )
        return jsonify({'sessionId': session.id}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reserva_bp.route('/confirm-reserva', methods=['POST'])
@jwt_required()
def confirm_reserva():
    payload = request.get_json() or {}
    session_id = payload.get('session_id')
    if not session_id:
        return jsonify({'error': 'Falta session_id'}), 400

    # Recupera la sesión
    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.InvalidRequestError:
        return jsonify({'error': 'Sesión Stripe no encontrada'}), 400

    if session.payment_status != 'paid':
        return jsonify({'error': 'Pago no completado'}), 400

    # Extrae metadata y crea la reserva
    meta = session.metadata
    slots       = json.loads(meta['slots'])          # lista de "HH:MM"
    freq_minutes= int(meta['frecuencia'])
    base_data   = {
      'user':       meta['user'],
      'idCancha':   int(meta['idCancha']),
      'fecha':      meta['fecha'],
      'estado':     'Confirmada',
      'metodoPago': 'Tarjeta de credito'
    }
    reservas_creadas = []
    for start in slots:
        # calcula horaFin sumando freq_minutes
        h, m = map(int, start.split(':'))
        dt = datetime.combine(datetime.today(), datetime.strptime(start, "%H:%M").time())
        dt_end = dt + timedelta(minutes=freq_minutes)
        end = dt_end.time().strftime("%H:%M")

        data_slot = {
            **base_data,
            'horaInicio': start,
            'horaFin':    end,
            'monto':      float(meta['monto']) / len(slots)  # prorratea si quieres
        }
        resp, status = crear_reserva_interna(data_slot, stripe_payment_id=session_id)
        if status == 201:
            reservas_creadas.append(resp.get_json()['reserva'])
        else:
            # si falla en uno, aborta todo
            return resp, status

    return jsonify({
        'message': 'Todas las reservas creadas',
        'reservas': reservas_creadas
    }), 201
    

#finalizan los endpoinys para stripe
#---------------------------------------------------------------------------------------------------------------


#---------------------------------------------------------------------------------------------------------------
# endpoints para obtener todas las reservas y disponibilidad de canchas	

@reserva_bp.route('/all', methods=['GET'])
def obtener_reservas():
    reservas = Reserva.query.all()
    return jsonify([reserva.serialize() for reserva in reservas]), 200

@reserva_bp.route('/cancha/disponibilidad', methods=['POST'])
def disponibilidad():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Se requiere un JSON'}), 400

        id_cancha = data.get('idCancha')
        fecha_str = data.get('fecha')
        
        if not id_cancha or not fecha_str:
            return jsonify({'error': 'Parámetros incompletos'}), 400

        cancha = Cancha.query.get(id_cancha)
        if not cancha:
            return jsonify({'error': 'Cancha no encontrada'}), 404

        fecha_dt = datetime.strptime(fecha_str, "%d/%m/%Y").date()

        # Validar día de la semana contra diasDisponibles
        dias_disponibles = cancha.horario.diasDisponibles or ''
        dias_list = [d.strip().lower() for d in dias_disponibles.split(',') if d.strip()]
        nombres_semana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
        dia_nombre = nombres_semana[fecha_dt.weekday()]
        if dia_nombre not in dias_list:
            return jsonify({'error': f'La [ {cancha.nombre} ] no está disponible los días {dia_nombre.capitalize()}'}), 400
        
        # Configuración de horario
        hi = cancha.horario.horarioInicio
        hf = cancha.horario.horarioFin
        freq_min = FRECUENCIAS_PERMITIDAS.get(cancha.horario.frecuencia.lower(), 60)
        
        # Obtener reservas existentes
        reservas = Reserva.query.filter_by(idCancha=id_cancha, fecha=fecha_dt).all()
        ocupados = [(r.horaInicio, r.horaFin) for r in reservas]
        
        # Generar slots disponibles
        slots = []
        current_time = datetime.combine(fecha_dt, hi)
        end_time = datetime.combine(fecha_dt, hf)
        
        while current_time + timedelta(minutes=freq_min) <= end_time:
            slot_start = current_time.time()
            slot_end = (current_time + timedelta(minutes=freq_min)).time()
            
            disponible = True
            for inicio, fin in ocupados:
                if slot_start < fin and slot_end > inicio:
                    disponible = False
                    break
            
            if disponible:
                slots.append(slot_start.strftime("%H:%M"))
            
            current_time += timedelta(minutes=freq_min)
        
        return jsonify({
            'idCancha': id_cancha,
            'fecha': fecha_str,
            'horarios_disponibles': slots
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

#---------------------------------------------------------------------------------------------------------------


#----------------------------------------------------------------------------------------------------------------
# Endpoints para obtener reservas por usuario


@reserva_bp.route('/usuario', methods=['GET'])
@jwt_required()
def obtener_reservas_usuario():
    # Obtener el nombre de usuario del token JWT
    nombre_usuario = get_jwt_identity()

    # Buscar el usuario en la base de datos
    usuario = Usuario.query.filter_by(nombreUsuario=nombre_usuario).first()
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    # Obtener las reservas del usuario
    reservas = Reserva.query.filter_by(idUsuario=usuario.idUsuario).all()
    
    # Serializar las reservas
    reservas_serializadas = [reserva.serialize() for reserva in reservas]

    return jsonify(reservas_serializadas), 200

#----------------------------------------------------------------------------------------------------------------