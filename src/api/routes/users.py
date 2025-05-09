from datetime import timedelta
from flask import Blueprint, request, jsonify
from api.models import Usuario, Rol, UsuarioRol, db
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

users_bp = Blueprint('users', __name__, url_prefix='/users')


# ---------------------------- ------------Usuarios ---------------------------------------------

#------------------------------------------------------------------------------------------------

# 1) Ruta para obtener todos los usuarios registrados en la base de datos
# GET: /users
@users_bp.route('', methods=['GET'])
def list_users():
    return jsonify([u.serialize() for u in Usuario.query.all()])

#------------------------------------------------------------------------------------------------


#------------------------------------------------------------------------------------------------

# 2) Ruta para obtener un usuario por su id
# GET: /users/<int:idUsuario>
@users_bp.route('/<int:idUsuario>', methods=['GET'])
def get_user(idUsuario):

    user = Usuario.query.get(idUsuario)
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404	
    return jsonify(user.serialize())

#------------------------------------------------------------------------------------------------


#------------------------------------------------------------------------------------------------	

# 3) Ruta para crear un nuevo usuario
# POST: /users
@users_bp.route('/signup', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    if not data:
        return jsonify({'msg': 'No se recibieron datos'}), 400
    
    # Campos requeridos
    required_fields = ['nombre', 'email', 'clave', 'nombreUsuario', 'telefono', 'rol']

    # Verificamos que no falte ninguno de los campos requeridos ni que estén vacíos
    empty_fields = [field for field in required_fields if not data.get(field)]

    if empty_fields:
        return jsonify({
            'msg': 'Algunos campos están vacíos o faltan',
            'Campos vacíos o faltantes': empty_fields
        }), 400
    
    # Verifica que el rol sea uno de los permitidos
    rol_obj = Rol.query.filter_by(nombre=data['rol']).first()
    if not rol_obj:
        return jsonify({'msg': "El rol: " + data['rol'] + " no existe"}), 400
    

    #Esto es para verificar si el usuario ya existe con otro rol, lo que significa que desean registarle otro rol 
    user_with_other_rol = Usuario.query.filter_by(
        nombre=data['nombre'],
        nombreUsuario=data['nombreUsuario'],
        clave=data['clave'],
        email=data['email'],
        telefono=data['telefono']
    ).first()


    #-----------------------------------------------------------------------------------------------------------------
    #En este caso el usuario ya existe pero con otro rol, quiere decir que se le puede agregar un nuevo rol
    if user_with_other_rol:

        # Verifica si el usuario ya tiene el rol que se intenta agregar
        existing_user_role = UsuarioRol.query.filter_by(
            idUsuario=user_with_other_rol.idUsuario,
            idRol=rol_obj.idRol
        ).first()

        if existing_user_role:
            return jsonify({'msg': 'El usuario: ' + data['nombreUsuario'] + ' ya tiene el rol: ' + data['rol']}), 400
        
        nuevo_rol_usuario = UsuarioRol(
            idUsuario=user_with_other_rol.idUsuario,
            idRol=rol_obj.idRol,
        )

        db.session.add(nuevo_rol_usuario)
        db.session.commit()
        return jsonify({
            'msg': 'Rol ' + data['rol'] + ', agregado exitosamente al usuario: ' + data['nombreUsuario'],
            'usuario': user_with_other_rol.serialize()
        }), 201
    
    #Finaliza el if de la verificacion de si existe el usuario con otro rol
    #-----------------------------------------------------------------------------------------------------------------
   
    #-----------------------------------------------------------------------------------------------------------------
    # Aqui entramos si no hay ningun coincidente en BD, es decir se crea un nuevo usuario de cero
    else: 
        # Verifica si el usuario ya existe
        existing_user = Usuario.query.filter_by(email=data.get('email')).first()
        if existing_user:
            return jsonify({'msg': 'El email colocado ya existe'}), 409
        
        #Verifica si el nombre de usuario ya existe
        existing_username = Usuario.query.filter_by(nombreUsuario=data.get('nombreUsuario')).first()
        if existing_username:
            return jsonify({'msg': 'El nombre de usuario ya existe'}), 409
        
        ################################################################################
        #Validación del número telefónico
        telefono = data.get('telefono')

        # Verifica que el número sea numérico y de exactamente 10 caracteres
        if not (telefono.isdigit() and (len(telefono) == 10)):
            return jsonify({'msg': 'El número telefónico debe ser numérico y tener exactamente 10 dígitos'}), 400

        # Verifica si el número ya existe
        existing_phone = Usuario.query.filter_by(telefono=telefono).first()
        if existing_phone:
            return jsonify({'msg': 'El número telefónico ya está registrado'}), 409
        
        #################################################################################
        
        # Crear usuario
        nuevo = Usuario(
            nombre=data['nombre'],
            email=data['email'],
            clave=data['clave'],
            telefono=data.get('telefono'),
            nombreUsuario=data['nombreUsuario']
        )
        db.session.add(nuevo)

        #Obtiene el id del nuevo usuario antes de hacer el commit a la bd
        db.session.flush() 

        # Asociar usuario con rol y club
        rol_usuario = UsuarioRol(
            idUsuario=nuevo.idUsuario,
            idRol=rol_obj.idRol,
        )
        db.session.add(rol_usuario)
    
        db.session.commit()

        return jsonify({
            'msg': 'Usuario creado exitosamente',
            'usuario': nuevo.serialize()
        }), 201
    
        #Finaliza el Else
        #----------------------------------------------------------------------------------------

#------------------------------------------------------------------------------------------------


#------------------------------------------------------------------------------------------------

# 4) Ruta para loguear un usuario
# POST: /users/login
@users_bp.route('/login', methods=['POST'])
def login_user():

    data = request.get_json() or {}
    if not data:
        return jsonify({'msg': 'No se recibieron datos'}), 400
    
    # Campos requeridos
    required_fields = ['nombreUsuario', 'clave', 'rol']

    # Verificamos que no falte ninguno de los campos requeridos ni que estén vacíos
    empty_fields = [field for field in required_fields if not data.get(field)]

    if empty_fields:
        return jsonify({
            'msg': 'Algunos campos están vacíos o faltan',
            'Campos vacíos o faltantes': empty_fields
        }), 400
    
    #Validamos que exista en bd
    user = Usuario.query.filter_by(nombreUsuario = data.get("nombreUsuario"), clave = data.get("clave")).first()

    if user is None:
        # Usuario no encontrad
        return jsonify({"msg": "Error en el nombre de Usuario o en la clave de acceso"}), 401
    
    # Verifica que el rol sea uno de los permitidos
    rol_obj = Rol.query.filter_by(nombre=data['rol']).first()
    if not rol_obj:
        return jsonify({'msg': "El rol: " + data['rol'] + " no existe"}), 400
    
    #Validamos que exista el rol en bd
    rol_prop = Rol.query.filter_by(nombre=data['rol']).first()

    # Revisamos si ya hay un UsuarioRol “Propietario” sin club asignado
    ur = UsuarioRol.query.filter_by(
        idUsuario=user.idUsuario,
        idRol=rol_prop.idRol,
    ).first()

    if ur is None:
        return jsonify({"msg": "El usuario: " + data['nombreUsuario'] + ", no tiene el rol: " + data['rol']}), 401

    #Armamos la lista de los roles del usuario
    roles = [ur.rol.nombre for ur in user.usuario_roles if ur.rol is not None]
    
    # Crea el token de acceso JWT
    access_token = create_access_token(
        identity=user.nombreUsuario,
        expires_delta=timedelta(hours=1),
        additional_claims={"roles": roles} # Agrega los roles al token
    ) 
    return jsonify({ "msg" : "Acceso otorgado al usuario: " + user.nombreUsuario ,"token": access_token , "roles": roles}), 200

#------------------------------------------------------------------------------------------------


#------------------------------------------------------------------------------------------------

# 5) Ruta para eliminar un usuario por su id
# DELETE: /users/<int:idUsuario>
@users_bp.route('/<int:idUsuario>', methods=['DELETE'])
def delete_user(idUsuario):
    user = Usuario.query.get(idUsuario)
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    
    # Verificar si tiene reservas
    if user.reservas:  
        return jsonify({
            "msg": "No se puede eliminar el usuario porque tiene reservas activas",
            "reservas": [r.idReserva for r in user.reservas]
        }), 400  
    
    # Eliminar el usuario y sus relaciones
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'msg': 'Usuario eliminado exitosamente'}), 200

#------------------------------------------------------------------------------------------------



#------------------------------------------------------------------------------------------------

# 6) Ruta para actualizar un usuario por su email
# PUT: /users/<int:idUsuario>
@users_bp.route('/edit', methods=['PUT'])
@jwt_required()
def update_user():
    data = request.get_json() or {}
    if not data:
        return jsonify({'msg': 'No se recibieron datos'}), 400
    
    #Obtenemos el 
    nombreUsuario = get_jwt_identity()
    user = Usuario.query.filter_by(nombreUsuario=nombreUsuario).first()
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    # Si viene nombreUsuario, chequear que no esté en uso por otro
    if 'email' in data:
        email = data.get('email').strip()
        if email:
            existing = Usuario.query.filter_by(email=email).first()
            if existing and existing.idUsuario != user.idUsuario:
                return jsonify({'msg': f"El email {data['email']} ya existe, elige otro"}), 409
            user.email = email

    if 'nombre' in data and data['nombre'].strip():
        user.nombre = data['nombre'].strip()

    if 'clave' in data and data['clave'].strip():
        if 'clave' in data and data['clave'].strip().length < 8:
            return jsonify({'msg': 'La clave debe tener al menos 8 caracteres'}), 400
        user.clave = data['clave'].strip()

    if 'telefono' in data and data['telefono'].strip():
       
        # Validación del número telefónico
        telefono = data.get('telefono')

        # Verifica que el número sea numérico y de exactamente 10 caracteres
        if telefono.length != 10 or not telefono.isdigit():
            return jsonify({'msg': 'El número telefónico debe ser numérico y tener exactamente 10 dígitos'}), 400
        
        # Verifica si el número ya existe
        existing_phone = Usuario.query.filter_by(telefono=telefono).first()
        if existing_phone and existing_phone.idUsuario != user.idUsuario:
            return jsonify({'msg': 'El número telefónico ya está registrado'}), 409
        
        # Si el número es válido y no está en uso, lo asignamos al usuario
        user.telefono = data['telefono'].strip()
    
    db.session.add(user)
    db.session.commit()

    return jsonify({'msg': 'Usuario actualizado exitosamente', 'usuario': user.serialize()}), 200


#Finaliza la funcion editar usuario
#------------------------------------------------------------------------------------------------


#------------------------------------------------------------------------------------------------
# 7) ruta para obtener los datos de un usuario por su nombre usuario
# GET: /userinfo

@users_bp.route('/userinfo', methods=['GET'])
@jwt_required()
def get_user_info():
    nombreUsuario = get_jwt_identity()
    user = Usuario.query.filter_by(nombreUsuario=nombreUsuario).first()
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    
    return jsonify({
        'msg': 'Información del usuario',
        'usuario': user.serialize()
    }), 200
