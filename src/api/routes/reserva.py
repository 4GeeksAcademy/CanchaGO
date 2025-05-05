from flask import Blueprint, request, jsonify
from api.models import db, Reserva, Usuario, Cancha
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

reserva_bp = Blueprint('reserva_bp', __name__, url_prefix='/reserva')


#---------------------------------------------------------------------------------------------------------------
# Endpoint para crear una reserva

@reserva_bp.route('/crear', methods=['POST'])
@jwt_required()
def crear_reserva():

    #Obtenemos los datos del cuerpo de la solicitud
    data = request.get_json()
    fecha = data.get('fecha')
    hora_inicio = data.get('horaInicio')
    hora_fin = data.get('horaFin')
    id_cancha = data.get('idCancha')
    id_deportista = data.get('idUsuario')
    estado = data.get('estado')
    metodo_pago = data.get('metodoPago')
    monto = data.get('monto')


    #1) Validamos que esten todos los campos requeridos
    # Campos requeridos
    required_fields = ['fecha', 'horaInicio', 'horaFin', 'idCancha', 'estado', 'metodoPago', 'monto']

    # Verificamos que no falte ninguno de los campos requeridos ni que estén vacíos
    empty_fields = [field for field in required_fields if not data.get(field)]

    if empty_fields:
        return jsonify({
            'msg': 'Algunos campos están vacíos o faltan',
            'Campos Vacios o Faltantes': empty_fields
        }), 400
        


    # 2) Verificamos la identidad del usuario que crea la reserva y que sea Deportista
    #Obtiene el token del usuario que crea el club
    jwt_data = get_jwt() 

    #Obtenemos los roles del usuario que crea el club
    roles = jwt_data.get("roles", [])

    if "Deportista" not in roles:
        return jsonify({"error": "El usuario no tiene el rol Deportista, por ende no puede crear una reserva"}), 401
    


    # 3) Verificamos que exista el usuario obtenido del token
    nombreUsuario = get_jwt_identity()
    usuario = Usuario.query.filter_by(nombreUsuario=nombreUsuario).first()
    if not usuario:
        return jsonify({"error": "El usuario: " + nombreUsuario + ", no existe"}), 404
    


    #4) Validar que el idCancha exista en la base de datos
    cancha = Cancha.query.filter_by(idCancha=data['idCancha']).first()
    if not cancha:
        return jsonify({"error": "La cancha con id " + str(data['idCancha']) + " no existe"}), 404
    


     # 5) Validar y parsear fecha (dd/mm/aaaa), de igual forma validar que la fecha sea un dia dispoinible de la cancha
    try:
        fecha_dt = datetime.strptime(data['fecha'], "%d/%m/%Y").date()
    except ValueError:
        return jsonify({
            'error': 'Formato de fecha inválido. Debe ser dd/mm/aaaa'
        }), 400
    
    if fecha_dt < datetime.now().date():
        return jsonify({
            'error': 'La fecha no puede ser menor a la fecha actual'
        }), 400
    
    # ——————— Validar día disponible ———————
    # a) Mapeo weekday → nombre en español
    dias_semana = {
        0: "Lunes", 1: "Martes", 2: "Miercoles",
        3: "Jueves", 4: "Viernes", 5: "Sabado", 6: "Domingo"
    }
    dia_reserva = dias_semana[fecha_dt.weekday()]

    #b)Obtener los días disponibles de la cancha
    dias_disp = []
    if cancha.horario.diasDisponibles:
        # Partimos, quitamos espacios y normalizamos a minúsculas  
        dias_disp = [d.strip().lower() for d in cancha.horario.diasDisponibles.split(',')]

    # c) Chequear si está permitido
    if dia_reserva.lower() not in dias_disp:
        return jsonify({
            'error': f' La cancha no se puede reservar los {dia_reserva}. ' +
                     f'Días disponibles: {cancha.horario.diasDisponibles}'
        }), 400
    # ————————————————————————————————



    # 6) Parsear horaInicio y horaFin y descartar segundos
    def parse_hora(h):
        for fmt in ("%H:%M:%S", "%H:%M"):
            try:
                t = datetime.strptime(h, fmt).time()
                # Tiramos los segundos y microsegundos
                return t.replace(second=0, microsecond=0)
            except ValueError:
                pass
        return None

    hora_inicio = parse_hora(data['horaInicio'])
    hora_fin    = parse_hora(data['horaFin'])
    if not hora_inicio or not hora_fin:
        return jsonify({'error': 'Formato de hora inválido. Debe ser HH:MM o HH:MM:SS'}), 400
    


    # 7) Validar que exista reserva y este disponible el horario
    reservas_existentes = Reserva.query.filter(
        Reserva.idCancha == data['idCancha'],
        Reserva.fecha == fecha_dt,
        (Reserva.horaInicio < hora_fin) & (Reserva.horaFin > hora_inicio)
    ).all()
    if reservas_existentes:
        return jsonify({"error": "La cancha ya está reservada en ese horario."}), 400 
    
    # ——— 7.1) Validar hora inicio y fin de la cancha———
    hi_sched = cancha.horario.horarioInicio  
    hf_sched = cancha.horario.horarioFin     
    if hora_inicio < hi_sched or hora_fin > hf_sched:
        return jsonify({
            'error': f'Reserva fuera de horario: solo puedes entre '
                     f'{hi_sched.strftime("%H:%M")} y {hf_sched.strftime("%H:%M")}'
        }), 400

    # ——— 7.2) Respetar frecuencia ———
    freq = cancha.horario.frecuencia.lower()  # p.ej. "1h" o "0.5h" o "30m"

    # Si la frecuencia es 1 hora exacta, minutos deben ser 00
    if freq == '1h':
        if hora_inicio.minute != 0 or hora_fin.minute != 0:
            return jsonify({'error': 'Con frecuencia 1h, minutos deben ser 00'}), 400

    # Si la frecuencia es media hora, minutos pueden ser 00 o 30
    elif freq in ('30m'):
        if hora_inicio.minute not in (0,30) or hora_fin.minute not in (0,30):
            return jsonify({'error': 'Con frecuencia media hora, minutos deben ser 00 o 30'}), 400



    # 8) Validar el monto mayor a 0
    monto = data.get('monto')
    # Verificar que el monto sea un número mayor a cero
    try:
        monto = float(monto)
        if monto <= 0:
            return jsonify({'error': 'El monto debe ser mayor a cero'}), 400
    except ValueError:
        return jsonify({'error': ' Monto inválido'}), 400
    

    
    # 9) Validar el estado de la reserva
    estados_validos = ['Pendiente', 'Confirmada','Cancelada']
    if data['estado'] not in estados_validos:
        return jsonify({'error': 'Estado inválido. Debe ser Pendiente, Confirmada o Cancelada'}), 400
    


    # 10) Validar el método de pago
    metodos_pago_validos = ['Efectivo', 'Tarjeta de credito', 'Transferencia', 'Tarjeta de debito']
    if data['metodoPago'] not in metodos_pago_validos:
        return jsonify({'error': 'Método de pago inválido. Debe ser Efectivo, Tarjeta de credito, Transferencia o Tarjeta de debito'}), 400
    


    nueva_reserva = Reserva(
        fecha=fecha_dt,
        horaInicio=hora_inicio,
        horaFin=hora_fin,
        idCancha=data['idCancha'],
        idUsuario=usuario.idUsuario,
        estado=data['estado'],
        metodoPago=data['metodoPago'],
        monto=data['monto']
    )

    db.session.add(nueva_reserva)
    db.session.commit()

    return jsonify({"message": "Reserva creada exitosamente.", "reserva": nueva_reserva.serialize()}), 201


#Finalizamos el endpoint para crear una reserva
#---------------------------------------------------------------------------------------------------------------



#---------------------------------------------------------------------------------------------------------------
# Endpoint para obtener todas las reservas en bd

@reserva_bp.route('/all', methods=['GET'])
def obtener_reservas():
    reservas = Reserva.query.all()
    return jsonify([reserva.serialize() for reserva in reservas]), 200

#Finalizamos el endpoint para obtener todas las reservas en bd
#---------------------------------------------------------------------------------------------------------------





