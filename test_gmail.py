import smtplib
from email.mime.text import MIMEText

email = "canchago.app@gmail.com"
password = "bykrajhxagydpruf"

# Crea el mensaje con codificación UTF-8
msg = MIMEText("¡Funciona!", 'plain', 'utf-8')
msg['Subject'] = "Prueba SMTP"
msg['From'] = email
msg['To'] = "andresperez0401@gmail.com"

with smtplib.SMTP("smtp.gmail.com", 587) as server:
    server.starttls()
    server.login(email, password)
    server.send_message(msg)  # Usa send_message en lugar de sendmail

print("✅ ¡Correo enviado! Revisa tu bandeja.")