from flask import Blueprint, request, jsonify
from api.models import Usuario, db
from api.utils import APIException

users_bp = Blueprint('users', __name__, url_prefix='/users')

@users_bp.route('', methods=['GET'])
def list_users():
    return jsonify([u.serialize() for u in Usuario.query.all()])

@users_bp.route('', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    if not data.get('email') or not data.get('password'):
        raise APIException('Email y password requeridos',400)
    u = Usuario(email=data['email'], password=data['password'], is_active=True)
    db.session.add(u); db.session.commit()
    return jsonify(u.serialize()),201