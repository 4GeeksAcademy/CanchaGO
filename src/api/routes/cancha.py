from flask import Blueprint, request, jsonify
from api.models import Cancha, db

cancha_bp = Blueprint('cancha_bp', __name__, url_prefix='/canchas')

# Mock database


@cancha_bp.route('/api/canchas', methods=['POST'])
def agregar_cancha():
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        ubicacion = data.get('ubicacion')
        capacidad = data.get('capacidad')

        if not nombre or not ubicacion or not capacidad:
            return jsonify({"error": "Todos los campos son obligatorios"}), 400

        # Create a new Cancha instance
        nueva_cancha = Cancha(
            descripcion=data.get('descripcion', 'Sin descripción'),
            precioXHora=data.get('precioXHora', 1000),
            nombre=nombre,
            estado=data.get('estado', 'Disponible'),
            idClub=data.get('idClub'),
            idHorario=data.get('idHorario'),
            idDeporte=data.get('idDeporte'),
            ubicacion=ubicacion,
            capacidad=capacidad
        )

        # Save the new Cancha instance to the database
        db.session.add(nueva_cancha)
        db.session.commit()

        # Return the newly created Cancha as a JSON response
        return jsonify({
            "idCancha": nueva_cancha.idCancha,  # Assuming idCancha is auto-generated
            "descripcion": nueva_cancha.descripcion,
            "precioXHora": nueva_cancha.precioXHora,
            "nombre": nueva_cancha.nombre,
            "estado": nueva_cancha.estado,
            "idClub": nueva_cancha.idClub,
            "idHorario": nueva_cancha.idHorario,
            "idDeporte": nueva_cancha.idDeporte,
            "ubicacion": nueva_cancha.ubicacion,
            "capacidad": nueva_cancha.capacidad
        }), 201
       #Aca lo tengo que guardar en la base de datos
        return jsonify(nueva_cancha), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500