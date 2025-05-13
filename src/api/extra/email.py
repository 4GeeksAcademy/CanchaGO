# email.py (versión definitiva corregida)
import os
import base64
from flask_mail import Message
from flask import render_template, current_app
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Cargar logo en base64 (sin Mail() inicializado aquí)
_logo_path = os.path.join(os.path.dirname(__file__), 'img', 'canchago.png')
with open(_logo_path, 'rb') as f:
    _logo_b64 = base64.b64encode(f.read()).decode()
_logo_data_uri = f"data:image/png;base64,{_logo_b64}"

def send_reserva_confirmation(to_email, reserva):
    try:
        mail = current_app.extensions['mail']
        
        # Crear mensaje MIME multipart
        msg = Message(
            subject="✅ Reserva Confirmada – CanchaGO",
            recipients=[to_email],
            charset='utf-8'
        )
        msg.html = render_template(
            'emails/confirmacion_reserva.html',
            r=reserva.serialize()
        )
        
        # Añadir versión alternativa en texto plano
        msg.body = "Consulta el detalle de tu reserva en la versión HTML."
        
        mail.send(msg)
        
    except Exception as e:
        current_app.logger.error(f"Error enviando email: {str(e)}")
        raise

def send_reserva_cancellation(to_email, reserva):
    try:
        mail = current_app.extensions['mail']
        
        msg = Message(
            subject="❌ Reserva Cancelada – CanchaGO",
            recipients=[to_email],
            charset='utf-8'
        )
        
        msg.html = render_template(
            'emails/cancelacion_reserva.html',
            r=reserva.serialize()
        )
        
        mail.send(msg)
        
    except Exception as e:
        current_app.logger.error(f"Error enviando email de cancelación: {str(e)}")
        raise