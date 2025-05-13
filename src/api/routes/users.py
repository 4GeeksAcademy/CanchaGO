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
# POST: /users/signup
@users_bp.route('/signup', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    if not data:
        return jsonify({'msg': 'No se recibieron datos'}), 400
    
    # Campos requeridos
    required_fields = ['nombre', 'email', 'clave', 'nombreUsuario', 'telefono', 'rol']
    empty_fields = [f for f in required_fields if not data.get(f)]
    if empty_fields:
        return jsonify({
            'msg': 'Algunos campos están vacíos o faltan',
            'Campos vacíos o faltantes': empty_fields
        }), 400

    # Parsear uno o varios roles separados por comas
    roles_input = [r.strip() for r in data['rol'].split(',') if r.strip()]
    if not roles_input:
        return jsonify({'msg': 'Debes especificar al menos un rol'}), 400

    # Validar que cada rol exista en BD
    rol_objs = []
    for rol_name in roles_input:
        rol = Rol.query.filter_by(nombre=rol_name).first()
        if not rol:
            return jsonify({'msg': f'El rol "{rol_name}" no existe'}), 400
        rol_objs.append(rol)

    # Buscar usuario existente por email (único)
    existing_user = Usuario.query.filter_by(email=data['email']).first()

    # Validar teléfono numérico de 10 dígitos
    telefono = data['telefono']
    if not (telefono.isdigit() and len(telefono) == 10):
        return jsonify({'msg': 'El número telefónico debe ser numérico y tener exactamente 10 dígitos'}), 400
    if Usuario.query.filter_by(telefono=telefono).first() and (not existing_user or existing_user.telefono != telefono):
        return jsonify({'msg': 'El número telefónico ya está registrado'}), 409

    # Validar username único
    if Usuario.query.filter_by(nombreUsuario=data['nombreUsuario']).first() and (not existing_user or existing_user.nombreUsuario != data['nombreUsuario']):
        return jsonify({'msg': 'El nombre de usuario ya existe'}), 409

    if existing_user:
        # Usuario ya existe: solo agregar los roles nuevos que no tenga
        added = []
        for rol in rol_objs:
            if not UsuarioRol.query.filter_by(idUsuario=existing_user.idUsuario, idRol=rol.idRol).first():
                ur = UsuarioRol(idUsuario=existing_user.idUsuario, idRol=rol.idRol)
                db.session.add(ur)
                added.append(rol.nombre)
        if not added:
            return jsonify({'msg': 'El usuario ya tiene todos los roles solicitados'}), 400
        db.session.commit()
        return jsonify({
            'msg': f'Roles {added} agregados exitosamente al usuario {existing_user.nombreUsuario}',
            'usuario': existing_user.serialize()
        }), 200

    # Crear nuevo usuario
    nuevo = Usuario(
        nombre=data['nombre'],
        email=data['email'],
        clave=data['clave'],
        telefono=telefono,
        nombreUsuario=data['nombreUsuario']
    )
    db.session.add(nuevo)
    db.session.flush()  # asigna nuevo.idUsuario

    # Asociar todos los roles al usuario
    for rol in rol_objs:
        db.session.add(UsuarioRol(idUsuario=nuevo.idUsuario, idRol=rol.idRol))

    db.session.commit()
    return jsonify({
        'msg': 'Usuario creado exitosamente',
        'usuario': nuevo.serialize()
    }), 201


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
# PUT: /users/edit
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

    # Validar email
    if 'email' in data:
        new_email = data.get('email', '').strip().lower()
        if new_email != user.email:
            if Usuario.query.filter_by(email=new_email).first():
                return jsonify({'msg': 'El email ya está registrado'}), 409
            user.email = new_email

    # Validar contraseña
    if 'clave' in data and data['clave'].strip():
        if len(data['clave'].strip()) < 8:
            return jsonify({'msg': 'La clave debe tener al menos 8 caracteres'}), 400
        user.clave = data['clave'].strip()

    # Validar teléfono
    if 'telefono' in data and data['telefono'].strip():
        telefono = data['telefono'].strip()
        if len(telefono) != 10 or not telefono.isdigit():
            return jsonify({'msg': 'Teléfono inválido'}), 400
        if Usuario.query.filter(Usuario.telefono == telefono, Usuario.idUsuario != user.idUsuario).first():
            return jsonify({'msg': 'Teléfono ya registrado'}), 409
        user.telefono = telefono

    # Actualizar nombre
    if 'nombre' in data and data['nombre'].strip():
        user.nombre = data['nombre'].strip()

    try:
        db.session.commit()
        return jsonify({'msg': 'Usuario actualizado', 'usuario': user.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Error al actualizar usuario'}), 500


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
        'usuario': {**user.serialize(), "clave": user.clave}
    }), 200
