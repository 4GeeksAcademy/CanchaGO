from flask import Blueprint, request, jsonify, redirect, render_template
from api.models import db, Reserva, Usuario, Cancha, Club, UsuarioRol
from datetime import datetime, timedelta, date, time, timezone
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
import json
from api.extra.horario import validar_hora, calcular_intervalos, FRECUENCIAS_PERMITIDAS, DIAS_PERMITIDOS
from api.extra.email import send_reserva_confirmation, send_reserva_cancellation
import stripe
import os
import pytz

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
        stripe_payment_id=data['stripe_payment_id']
    )

    db.session.add(nueva_reserva)
    db.session.commit()


    #Correo de confirmacion
    send_reserva_confirmation(usuario.email, nueva_reserva)

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

    try:
        # Obtener sesión y payment intent
        session = stripe.checkout.Session.retrieve(session_id)
        payment_intent_id = session.payment_intent  # <--- Clave para reembolsos
        
        if session.payment_status != 'paid':
            return jsonify({'error': 'Pago no completado'}), 400

        # Extraer metadata
        meta = session.metadata
        slots = json.loads(meta['slots'])
        freq_minutes = int(meta['frecuencia'])
        
        base_data = {
            'user': meta['user'],
            'idCancha': int(meta['idCancha']),
            'fecha': meta['fecha'],
            'estado': 'Confirmada',
            'metodoPago': 'Tarjeta de credito'
        }

        reservas_creadas = []
        for start in slots:
            # Calcular hora fin
            dt = datetime.combine(datetime.today(), datetime.strptime(start, "%H:%M").time())
            dt_end = dt + timedelta(minutes=freq_minutes)
            end = dt_end.time().strftime("%H:%M")

            data_slot = {
                **base_data,
                'horaInicio': start,
                'horaFin': end,
                'monto': float(meta['monto']) / len(slots),
                'stripe_payment_id': payment_intent_id  # <--- Guardar payment_intent
            }
            
            # Crear reserva con payment_intent
            resp, status = crear_reserva_interna(data_slot)
            if status == 201:
                reservas_creadas.append(resp.get_json()['reserva'])
            else:
                # Rollback de Stripe si falla
                stripe.Refund.create(payment_intent=payment_intent_id)
                return resp, status

        return jsonify({
            'message': 'Todas las reservas creadas',
            'reservas': reservas_creadas
        }), 201

    except stripe.error.StripeError as e:
        return jsonify({'error': f'Error Stripe: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500
    

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
        reservas = Reserva.query.filter(
            Reserva.idCancha == id_cancha,
            Reserva.fecha == fecha_dt,
            Reserva.estado != 'Cancelada'
        ).all()
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



#----------------------------------------------------------------------------------------------------------------
# Endpoint para cancelar una reserva

@reserva_bp.route('/<string:id_reserva>', methods=['DELETE'])
@jwt_required()
def cancel_reservation(id_reserva):
    try:
        # 1) Verificar permisos
        current_user = get_jwt_identity()
        reserva_principal = Reserva.query.get_or_404(id_reserva)
        if reserva_principal.usuario.nombreUsuario != current_user:
            return jsonify({'error': 'No autorizado'}), 403

        # 2) Traer reservas hermanas confirmadas
        reservas_grupo = Reserva.query.filter_by(
            stripe_payment_id=reserva_principal.stripe_payment_id,
            estado='Confirmada'
        ).all()
        if not reservas_grupo:
            return jsonify({'error': 'No hay reservas para cancelar'}), 404
        
        
        #Del grupo de reservas, tomamos la primera reserva (la más cercana a la fecha/hora actual)
        reserva_early = min(reservas_grupo, key=lambda r: (r.fecha, r.horaInicio))
        
        now = datetime.now()  
        reserva_dt = datetime.combine(reserva_early.fecha, reserva_early.horaInicio)

        if reserva_dt.date() < now.date():
            return jsonify({'error': 'La reserva ya ha finalizado'}), 400
        
        if reserva_dt.date() == now.date():
            diff = reserva_dt - now
            horas_para_reserva = diff.total_seconds() / 3600

            # Cambia el 2 a las horas mínimas que quieras antes de cancelar
            if horas_para_reserva < 2:
                return jsonify({
                    'error': 'Cancelación permitida hasta 2 horas antes',
                    'detalle': f'Tiempo restante: {horas_para_reserva:.2f} horas'
                }), 400


        # 8) Reembolso Stripe si aplica
        if reserva_principal.stripe_payment_id:
            try:
                stripe.Refund.create(
                    payment_intent= reserva_principal.stripe_payment_id,
                    reason='requested_by_customer'
                )
            except stripe.error.InvalidRequestError as e:
                # si ya estaba reembolsado o id inválido, podemos ignorar o manejar distinto
                if "has already been refunded" in str(e):
                    pass
                else:
                    db.session.rollback()
                    return jsonify({'error': f'Error en reembolso Stripe: {str(e)}'}), 500

        usuario = usuario = Usuario.query.filter_by(nombreUsuario=current_user).first()

        # 9) Marcar todas las reservas del grupo
        for r in reservas_grupo:
            r.estado = 'Cancelada'

            #Mandamos el email de cancelacion de cada reserva
            send_reserva_cancellation(usuario.email, r)

        db.session.commit()

        return jsonify({
            'message': f'{len(reservas_grupo)} reserva(s) cancelada(s) exitosamente',
            'reembolso': 'completo' if reserva_principal.stripe_payment_id else 'no aplica'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error interno: {str(e)}'}), 500
    

#Finaliza el endpoint para cancelar reservas
#----------------------------------------------------------------------------------------------------------------



#----------------------------------------------------------------------------------------------------------------
#Endpoint para obtener reservas de los clubes de un propietario

@reserva_bp.route('/propietario', methods=['GET'])
@jwt_required()
def get_reservas_propietario():
    try:
        current_user = get_jwt_identity()
        
        # 1. Obtener todos los clubs del propietario
        usuario = Usuario.query.filter_by(nombreUsuario=current_user).first()
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        clubs_propietario = Club.query.join(UsuarioRol).filter(
            UsuarioRol.idUsuario == usuario.idUsuario,
            UsuarioRol.rol.has(nombre='Propietario')
        ).all()
        
        # 2. Obtener todas las reservas de sus canchas
        reservas = []
        for club in clubs_propietario:
            for cancha in club.canchas:
                reservas_cancha = Reserva.query.filter_by(
                    idCancha=cancha.idCancha
                ).all()
                reservas.extend([r.serialize() for r in reservas_cancha])
        
        return jsonify({'reservas': reservas}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reserva_bp.route("/test-email", methods=['GET'])
def test_email():
    try:
        reserva_fake = Reserva(
            fecha=datetime(2025, 5, 13),
            horaInicio="18:00",
            horaFin="19:00",
            monto=20,
            cancha=Cancha(nombre="Cancha 1", club=Club(nombre="Club CR7"))
        )        
        send_reserva_confirmation('andresperez0401@gmail.com', reserva_fake)
        return "Email enviado correctamente", 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500