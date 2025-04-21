from flask import Blueprint, request, jsonify
from api.models import db, Usuario

hello_bp = Blueprint('hello_bp', __name__)

@hello_bp.route('/hello', methods=['GET', 'POST'])
def handle_hello():
    if request.method == 'GET':
        email = 'pana@example.com'
        user = Usuario.query.filter_by(email=email).first()

        if user:
            return jsonify({'msg': 'El usuario ya existe', 'user': user.serialize()}), 200
        
        user = Usuario(email=email, password='secret', is_active=True)
        db.session.add(user)
        db.session.commit()
        return jsonify({'msg': 'Usuario creado', 'user': user.serialize()}), 201

    # POST: solo retorna lo que envíes
    data = request.get_json() or {}
    return jsonify({'you_sent': data}), 200
