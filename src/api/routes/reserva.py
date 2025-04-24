from flask import Blueprint, request, jsonify
from api.models import db, Reserva

reserva_bp = Blueprint('reserva_bp', __name__, url_prefix='/reserva')