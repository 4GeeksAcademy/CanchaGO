from flask import Blueprint, request, jsonify
from api.models import Cancha, db, Deporte, Usuario, Horario,Club
from api.extra.horario import validar_hora, calcular_intervalos, FRECUENCIAS_PERMITIDAS, DIAS_PERMITIDOS
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

cancha_bp = Blueprint('cancha_bp', __name__, url_prefix='/cancha')



#--------------------------------------------- Canchas ---------------------------------------------

#---------------------------------------------------------------------------------------------------

# 1) Endpoint para obtener todas las canchas de la base de datos
# GET: /canchas
@cancha_bp.route('/all', methods=['GET'])
def obtener_canchas():
    canchas = Cancha.query.all()
    return jsonify([cancha.serialize() for cancha in canchas]), 200

#---------------------------------------------------------------------------------------------------


#----------------------------------------------------------------------------------------------------
# 2) Endpoint para obtener una cancha por su id
# GET: /canchas/<int:idCancha>
@cancha_bp.route('/<int:idCancha>', methods=['GET'])
def obtener_cancha_por_id(idCancha):
    cancha = Cancha.query.get(idCancha)
    if not cancha:
        return jsonify({'msg': 'Cancha no encontrada'}), 404	
    return jsonify(cancha.serialize()), 200

#----------------------------------------------------------------------------------------------------


#----------------------------------------------------------------------------------------------------

# 3) Endpoint para crear una nueva cancha
# POST: /cancha

@cancha_bp.route('', methods=['POST'])
@jwt_required()
def crear_cancha():

    data = request.get_json() or {}
    # Validación básica
    if not data:
        return jsonify({'error': 'Datos requeridos'}), 400
    
    campos_requeridos = [
        'nombre', 'precio', 'emailClub', 'deporte',
        'horaInicio', 'horaFin', 'frecuencia', 'dias'
    ]
    
    faltantes = [campo for campo in campos_requeridos if campo not in data]
    if faltantes:
        return jsonify({
            'error': 'Campos faltantes',
            'campos_faltantes': faltantes
        }), 400

    # Validación de horas
    hora_inicio = validar_hora(data['horaInicio'])
    hora_fin = validar_hora(data['horaFin'])
    
    if not hora_inicio or not hora_fin:
        return jsonify({'error': 'Formato de hora inválido. Usar HH:MM'}), 400
    
    if hora_inicio >= hora_fin:
        return jsonify({'error': 'La hora de inicio debe ser anterior a la hora final'}), 400

    # Validación frecuencia
    frecuencia = data['frecuencia']
    if frecuencia not in FRECUENCIAS_PERMITIDAS:
        return jsonify({
            'error': 'Frecuencia no permitida',
            'frecuencias_permitidas': list(FRECUENCIAS_PERMITIDAS.keys())
        }), 400

    # Calcular intervalos
    minutos_frecuencia = FRECUENCIAS_PERMITIDAS[frecuencia]
    intervalos = calcular_intervalos(data['horaInicio'], data['horaFin'], minutos_frecuencia)
        
    if not intervalos:
        return jsonify({
            'error': 'El rango horario no es compatible con la frecuencia, debe ser divisible por la frecuencia',
        }), 400

    # Validación días para que envien dias validos, se deven enviar asi:
    # "dias" : "Lunes, Martes, Miercoles"
    dias = [d.strip().capitalize() for d in data['dias'].split(',')]
    dias_invalidos = [d for d in dias if d not in DIAS_PERMITIDOS]
    
    if dias_invalidos:
        return jsonify({
            'error': 'Días inválidos',
            'dias_invalidos': dias_invalidos,
            'dias_permitidos': list(DIAS_PERMITIDOS)
        }), 400
    

    #Obtiene el id del deporte a crear la cancha
    deporte = data['deporte']
    deporte_obj = Deporte.query.filter_by(nombre=deporte).first()
    if not deporte_obj:
        return jsonify({'error': 'Deporte no encontrado'}), 404
    

    #Obtiene el id del club a crear la cancha
    club = data['emailClub']
    club_obj = Club.query.filter_by(email=club).first()
    if not club_obj:
        return jsonify({'error': 'email del club no encontrado'}), 404
    

    # Verifica que el usuario tenga el rol de Propietario y que sea el dueño del club
    jwt_data = get_jwt()
    user = Usuario.query.filter_by(nombreUsuario = get_jwt_identity()).first()	

    roles = jwt_data.get("roles", [])
    if "Propietario" not in roles:
        return jsonify({"error": "El usuario no tiene permisos para crear una cancha"}), 401
    
    # Verificamos si el usuario es propietario del club
    propietario = None
    for usuario_rol in club_obj.usuario_roles:
        if usuario_rol.usuario.idUsuario == user.idUsuario and usuario_rol.rol.nombre == "Propietario":
            propietario = usuario_rol
            break
    
    if not propietario:
        return jsonify({"error": "No se puede crear la cancha, el usuario: {user.nombreUsuario} ,no es el propietario del club :  {club_obj.nombre}"}), 401

    try:
        # Crear horario
        nuevo_horario = Horario(
            horarioInicio=hora_inicio,
            horarioFin=hora_fin,
            frecuencia=frecuencia,
            #Concatena el arreglo de dias en un string separado por comas
            #Ejemplo: "Lunes, Martes, Miercoles"
            diasDisponibles=','.join(dias)
        )
        
        db.session.add(nuevo_horario)
        db.session.flush()

        # Crear cancha
        nueva_cancha = Cancha(
            nombre=data['nombre'],
            precio=data['precio'],
            descripcion=data.get('descripcion', ''),

            #Despues se puede manejar como enumerados, de principio boolean
            estado=True,  

            idClub=club_obj.idClub,
            idDeporte=deporte_obj.idDeporte,
            idHorario=nuevo_horario.idHorario
        )
        
        db.session.add(nueva_cancha)
        db.session.commit()

        return jsonify({
            'mensaje': 'Cancha creada exitosamente',
            'cancha': nueva_cancha.serialize(),
            'horario': nuevo_horario.serialize(),
            'intervalos': intervalos if frecuencia != 'personalizado' else None
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
#Finaliza el endpoint para crear una cancha
#----------------------------------------------------------------------------------------------------