from flask import Blueprint, request, jsonify
from api.models import Club, db, Deporte, ClubDeporte, Usuario, UsuarioRol, Rol, Reserva
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

club_bp = Blueprint('club_bp', __name__, url_prefix='/club')


#--------------------------------------------- Clubes ---------------------------------------------


#--------------------------------------------------------------------------------------------------

# 1) Endpoint para crear un nuevo club en la bd
# POST: /club
@club_bp.route('/create', methods=['POST'])
@jwt_required()
def add_club():

    data = request.get_json() or {}
    if not data:
        return jsonify({'msg': 'No se recibieron datos'}), 400

    # Campos requeridos
    required_fields = ['nombre', 'email', 'telefono', 'deportes']

    # Verificamos que no falte ninguno de los campos requeridos ni que estén vacíos
    empty_fields = [field for field in required_fields if not data.get(field)]

    if empty_fields:
        return jsonify({
            'msg': 'Algunos campos están vacíos o faltan',
            'Campos Vacios o Faltantes': empty_fields
        }), 400
    
    #Verifica que no exiats el correo para un club en bd
    correo_exists = Club.query.filter_by(email=data["email"]).first()
    if correo_exists:
        return jsonify({"error": "El correo: " + data["email"] + " ya se encuentra registrado"}), 400
    
    #Verifica que no exiats el correo para un club en bd
    exist_phone = Club.query.filter_by(telefono=data["telefono"]).first()
    if exist_phone:
        return jsonify({"error": "El telefono: " + data["telefono"] + " ya se encuentra registrado"}), 400
    
    #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    #Validamos los deportes a agregar al club
    
    deportes = data.get("deportes", [])

    #Obtenemos los deportes de la base de datos
    deportes_bd = Deporte.query.all()
    deportes_bd = [deporte.nombre for deporte in deportes_bd]

    #Verificamos que los deportes a agregar al club existan en la base de datos
    for deporte in deportes:
        if deporte not in deportes_bd:
            return jsonify({"error": "El deporte: " + deporte + " no existe en la base de datos"}), 400
    
    #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    #Obtiene el token del usuario que crea el club
    jwt_data = get_jwt() 

    #Obtenemos los roles del usuario que crea el club
    roles = jwt_data.get("roles", [])

    if "Propietario" not in roles:
        return jsonify({"error": "El usuario no tiene permisos para crear un club"}), 401
    
    #Obtenemos los datos del club
    club_data = Club(
        nombre = data.get("nombre"),
        descripcion = data.get("descripcion", "Sin descripcion"),
        direccion = data.get("direccion", "Sin direccion"),
        googleMapsLink = data.get("googleMapsLink", "Sin link"),
        email = data.get("email"),
        telefono = data.get("telefono"),
        imagen = data.get("imagen", "Sin imagen"),
    ) 
    
    try:
        db.session.add(club_data)
        db.session.flush()

        #Agregamos los deportes al club
        for deporte in deportes:

            deporte_obj = Deporte.query.filter_by(nombre=deporte).first()
            if deporte_obj:
                #Agregamos cada deporte a la relacion ClubDeporte
                club_deporte = ClubDeporte(
                    idClub=club_data.idClub,
                    idDeporte=deporte_obj.idDeporte
                )
                db.session.add(club_deporte)

        # ———————————————————————— UsuarioRol ————————————————————————

        #Obtenemos Usuario que crea el club
        nombreUsuario = get_jwt_identity()
        usuario = Usuario.query.filter_by(nombreUsuario=nombreUsuario).first()
        rol_prop = Rol.query.filter_by(nombre="Propietario").first()

        # Revisamos si ya hay un UsuarioRol “Propietario” sin club asignado
        ur = UsuarioRol.query.filter_by(
            idUsuario=usuario.idUsuario,
            idRol=rol_prop.idRol,
            idClub=None
        ).first()

        if ur:
            # Si encontramos, le actualizamos el idClub
            ur.idClub = club_data.idClub
        else:
            # Si no, creamos uno nuevo
            new_ur = UsuarioRol(
                idUsuario=usuario.idUsuario,
                idClub   =club_data.idClub,
                idRol    =rol_prop.idRol
            )
            db.session.add(new_ur)

        db.session.commit()	
        
        return jsonify({"message": "Club creado exitosamente", "club": club_data.serialize()}), 201 

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ocurrió un error creando el club: {str(e)}"}), 500    

#Finaliza el endpoint para crear un club
#--------------------------------------------------------------------------------------------------


#--------------------------------------------------------------------------------------------------

# 2) Endpoint para obtener todos los clubes de la bd
# GET: /club
@club_bp.route('/all', methods=['GET'])
def get_all_clubs():
    return jsonify({"clubs": [club.serialize() for club in Club.query.all()]}), 200
    
#Finaliza el endpoint para obtener todos los clubes
#--------------------------------------------------------------------------------------------------


#--------------------------------------------------------------------------------------------------

# 3) Endpoint para obtener un club por id
# GET: /club/<id>
@club_bp.route('/<int:id>', methods=['GET'])
def get_club_by_id(id):
    try:
        #Obtenemos el club por id de la base de datos
        club = Club.query.get(id)
        
        #Si no hay clubes en la base de datos, devolvemos un mensaje
        if not club:
            return jsonify({"message": "No hay clubes con el id " + str(id) + " en la base de datos"}), 404
        
        #Devolvemos los clubes en formato json
        return jsonify({"club": club.serialize()}), 200

    except Exception as e:
        return jsonify({"error": f"Ocurrió un error obteniendo los clubes: {str(e)}"}), 500
    
#Finaliza el endpoint para obtener un club por id
#--------------------------------------------------------------------------------------------------


#--------------------------------------------------------------------------------------------------

# 4) Endpoint para eliminar un club por id
# DELETE: /club
@club_bp.route('', methods=['DELETE'])
@jwt_required()
def delete_club():
    try:

        #Obtiene el token del usuario que crea el club
        jwt_data = get_jwt() 

        #Obtenemos los roles del usuario que crea el club
        roles = jwt_data.get("roles", [])

        if "Propietario" not in roles:
            return jsonify({"error": "El usuario no tiene permisos para eliminar clubes"}), 401
        
        nombreUsuario = get_jwt_identity()

        #Verificamos que el usuario sea propietario del club a eliminar
        usuario = Usuario.query.filter_by(nombreUsuario=nombreUsuario).first()

        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        #Leemos la data entrante
        data = request.get_json() or {}

        email = data.get("email")
        if not email:
            return jsonify({"error": "No se ha proporcionado el email del club a eliminar"}), 400
                                  
        #Obtenemos el club por id de la base de datos
        club = Club.query.filter_by(email=email).first()

        #Si no hay clubes en la base de datos, devolvemos un mensaje
        if not club:
            return jsonify({"message": "No hay clubes con el email " + email + " en la base de datos"}), 404

       
        rol_prop = Rol.query.filter_by(nombre="Propietario").first()

        # Verificamos si el usuario es propietario del club
        ur_current = UsuarioRol.query.filter_by(
            idUsuario=usuario.idUsuario,
            idClub=club.idClub,
            idRol=rol_prop.idRol
        ).first()

        if not ur_current:
            return jsonify({"error": "El club no pertenece al usuario"}), 403
        

        cancha_ids = [c.idCancha for c in club.canchas]
        existe_reserva = Reserva.query.filter(
            Reserva.idCancha.in_(cancha_ids)
        ).first()
        if existe_reserva:
            return jsonify({
                "error": "No se puede eliminar el club porque tiene reservas en sus canchas"
            }), 400

        # Revisamos si ya hay un UsuarioRol “Propietario” sin club asignado
        all_propietarios = UsuarioRol.query.filter_by(
            idUsuario=usuario.idUsuario,
            idRol=rol_prop.idRol
        ).all()

        if len(all_propietarios) == 1:
            # Sólo una fila: le quitamos el idClub, pero mantenemos el rol
            ur_current.idClub = None

        #Eliminamos el club de la base de datos
        db.session.delete(club)
        db.session.commit()

        return jsonify({"message": "Club eliminado correctamente"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ocurrió un error eliminando el club: {str(e)}"}), 500
    
#Finaliza el endpoint para eliminar un club por id
#--------------------------------------------------------------------------------------------------


#--------------------------------------------------------------------------------------------------

#5) Endpoint para obtener los clubes por deporte
# GET: /club/deporte/<deporte>
@club_bp.route('/deporte/<string:deporte>', methods=['GET'])    
def get_clubs_by_deporte(deporte):
    try:
        #Obtenemos los clubes por deporte de la base de datos
        clubes = Club.query.join(ClubDeporte).join(Deporte).filter(Deporte.nombre == deporte).all()
        
        #Si no hay clubes en la base de datos, devolvemos un mensaje
        if not clubes:
            return jsonify({"message": "No hay clubes para el deporte " + deporte + " en la base de datos"}), 404
        
        #Devolvemos los clubes en formato json
        return jsonify({"clubs": [club.serialize() for club in clubes]}), 200
    except Exception as e:
        return jsonify({"error": f"Ocurrió un error obteniendo los clubes por deporte: {str(e)}"}), 500
    
#Finaliza el endpoint para obtener los clubes por deporte
#--------------------------------------------------------------------------------------------------


#--------------------------------------------------------------------------------------------------

# 6) Endpoint para obtener los clubes de un usuario
# GET: /club/usuario

@club_bp.route('/usuario', methods=['GET'])
@jwt_required()
def get_clubs_by_user():
    try:
        #Obtenemos el token del usuario que crea el club
        jwt_data = get_jwt() 

        #Obtenemos los roles del usuario que crea el club
        roles = jwt_data.get("roles", [])

        if "Propietario" not in roles:
            return jsonify({"error": "El usuario no tiene permisos para ver clubes"}), 401
        
        nombreUsuario = get_jwt_identity()

        #Verificamos que el usuario sea propietario del club a eliminar
        usuario = Usuario.query.filter_by(nombreUsuario=nombreUsuario).first()

        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        #Obtenemos los clubes del usuario de la base de datos
        clubes = Club.query.join(UsuarioRol).filter(UsuarioRol.idUsuario == usuario.idUsuario).all()
        
        #Si no hay clubes en la base de datos, devolvemos un mensaje
        if not clubes:
            return jsonify({"message": "No hay clubes para el usuario " + nombreUsuario + " en la base de datos"}), 204
        
        #Devolvemos los clubes en formato json
        return jsonify({"clubs": [club.serialize() for club in clubes]}), 200
    
    except Exception as e:
        return jsonify({"error": f"Ocurrió un error obteniendo los clubes por deporte: {str(e)}"}), 500
    

#Finaliza el endpoint para obtener los clubes de un usuario
#--------------------------------------------------------------------------------------------------


#--------------------------------------------------------------------------------------------------

# 7) Endpoint para actualizar un club por email
# PUT: /club/edit

@club_bp.route('/edit', methods=['PUT'])
@jwt_required()
def update_club():
    try:
        #Obtiene el token del usuario que crea el club
        jwt_data = get_jwt() 

        #Obtenemos los roles del usuario que crea el club
        roles = jwt_data.get("roles", [])

        if "Propietario" not in roles:
            return jsonify({"error": "El usuario no tiene permisos para editar clubes"}), 401
        
        nombreUsuario = get_jwt_identity()

        #Verificamos que el usuario sea propietario del club a editar
        usuario = Usuario.query.filter_by(nombreUsuario=nombreUsuario).first()

        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        #Leemos la data entrante
        data = request.get_json() or {}
        
        #Leemos el email del club a editar
        email = data.get("email")
        if not email:
            return jsonify({"error": "No se ha proporcionado el email del club a editar"}), 400	
                                  
        #Obtenemos el club por id de la base de datos
        club = Club.query.filter_by(email=email).first()

        #Si no hay clubes en la base de datos, devolvemos un mensaje
        if not club:
            return jsonify({"message": "No hay clubes con el email " + email + " en la base de datos"}), 404

        # Verificamos si el usuario es propietario del club
        propietario = None
        for usuario_rol in club.usuario_roles:
            if usuario_rol.usuario.idUsuario == usuario.idUsuario and usuario_rol.rol.nombre == "Propietario":
                propietario = usuario_rol
                break

        if not propietario:
            return jsonify({"error": "El club no pertenece al usuario, no se puede editar"}), 401
        
        #---------------------------------------------------------------------------------------------------------

        if data.get("nombre"):
            club.nombre = data["nombre"]

        existing = Club.query.filter(
            Club.telefono == data["telefono"],
            Club.email != email  # 👈 Excluir el club actual
    	).first()
        if existing:
            return jsonify({"error": "El telefono ya está en uso por otro club"}), 400
        
        # Campos libres
        club.direccion = data.get("direccion") if data.get("direccion") not in [None, ""] else "Sin dirección"
        club.googleMapsLink = data.get("googleMapsLink") if data.get("googleMapsLink") not in [None, ""] else "Sin link"
        club.descripcion = data.get("descripcion") if data.get("descripcion") not in [None, ""] else "Sin descripción"
        club.imagen = data.get("imagen") if data.get("imagen") not in [None, ""] else "Sin imagen"

          # ————— Validación y actualización de deportes —————
        if data.get("deportes"):
            nuevos_deportes = data.get("deportes") or []

            # 1) Validar que existan en DB
            deportes_bd = {d.nombre: d for d in Deporte.query.all()}
            invalidos = [d for d in nuevos_deportes if d not in deportes_bd]
            if invalidos:
                return jsonify({"error": f"Deportes inválidos: {invalidos}"}), 400

            # 2) Detectar cuáles deportes se quieren eliminar
            actuales = {cd.deporte.nombre: cd.deporte for cd in club.club_deportes}

            #Aqui en base a los id, obtenemos o separamos los que no estan en nuevos deportes
            to_remove = set(actuales.keys()) - set(nuevos_deportes)

            # 3) Para cada deporte a eliminar, verificar si hay canchas con ese deporte
            for dep_nombre in to_remove:
                dep_obj = actuales[dep_nombre]
                for cancha in club.canchas:
                    if cancha.deporte.idDeporte == dep_obj.idDeporte:
                        return jsonify({
                            "error": (
                                f'No se puede quitar el deporte "{dep_nombre}" '
                                "porque tiene canchas asociadas."
                            )
                        }), 400

            # 4) Pasó la validación, así que vaciamos y repoblamos la relación
            club.club_deportes.clear()
            for nombre_dep in nuevos_deportes:
                dep_obj = deportes_bd[nombre_dep]
                club.club_deportes.append(
                    ClubDeporte(idClub=club.idClub, idDeporte=dep_obj.idDeporte)
                )

        db.session.commit()
        return jsonify({"message": "Club actualizado exitosamente", "club": club.serialize()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Ocurrió un error editando el club: {str(e)}"}), 500
