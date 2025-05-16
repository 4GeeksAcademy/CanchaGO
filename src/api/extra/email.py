# email.py (versión definitiva corregida)
import os
import base64
from flask_mail import Message
from flask import render_template, current_app
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlalchemy import select
from api.models import UsuarioRol, Rol, Usuario

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



def send_notificacion_propietario(reserva):
    """
    Notifica a:
      1) Todos los usuarios con rol 'Propietario' de este club.
      2) Al email general del club.
    """
    mail = current_app.extensions['mail']

    # 2) Buscamos roles de Propietario de este club
    # propietarios = (
    #     UsuarioRol.query
    #     .join(Rol)
    #     .filter(
    #         UsuarioRol.idClub == reserva.cancha.idClub,
    #         Rol.nombre == 'Propietario'
    #     )
    #     .all()
    # )

    # 3) Construimos lista de (email, nombre) únicos
    destinatarios = {}
    # for ur in propietarios:
    #     destinatarios[ur.usuario.email] = ur.usuario.nombre

    # 4) Añadimos el email del club (si no coincide con ninguno de arriba)
    club_email = reserva.cancha.club.email
    destinatarios[club_email] = reserva.cancha.club.nombre

    # 5) Enviamos uno por uno
    for to_email, nombre_prop in destinatarios.items():
        msg = Message(
            subject="🔔 Nueva Reserva – CanchaGO",
            recipients=[to_email],
            charset='utf-8'
        )
        msg.html = render_template(
            'emails/notificacion_reserva_propietario.html',
            r=reserva.serialize(),
            propietario={'nombre': nombre_prop}
        )
        msg.body = (
            f"Tienes una nueva reserva [{reserva.idReserva}] "
            f"en {reserva.cancha.nombre} para el {reserva.fecha} "
            f"{reserva.horaInicio}-{reserva.horaFin}."
        )
        mail.send(msg)



def send_cancelacion_propietario(reserva):
    """
    Envía un email **solo** al email del club correspondiente,
    notificando que la reserva ha sido cancelada.
    """
    mail = current_app.extensions['mail']
    club_email = reserva.cancha.club.email
    club_nombre = reserva.cancha.club.nombre

    msg = Message(
        subject="❌ Reserva Cancelada – CanchaGO",
        recipients=[club_email],
        charset='utf-8'
    )

    # renderizamos la plantilla específica para el club
    msg.html = render_template(
        'emails/cancelacion_reserva_propietario.html',
        r=reserva.serialize(),
        propietario={'nombre': club_nombre}
    )
    msg.body = (
        f"La reserva [{reserva.idReserva}] en la cancha '{reserva.cancha.nombre}' "
        f"programada para {reserva.fecha} {reserva.horaInicio}-{reserva.horaFin} "
        "ha sido cancelada."
    )
    mail.send(msg)