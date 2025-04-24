from datetime import time, timedelta, datetime, date

# Mapa de frecuencias permitidas (minutos)
FRECUENCIAS_PERMITIDAS = {
    '30min': 30,
    '1h': 60
}

# Días permitidos
DIAS_PERMITIDOS = {
    'Lunes', 'Martes', 'Miercoles', 'Jueves',
    'Viernes', 'Sabado', 'Domingo'
}

def validar_hora(hora_str):

    #Convierte el string a un objeto time
    try:
        return time.fromisoformat(hora_str)
    except (ValueError, TypeError):
        return None

def calcular_intervalos(hora_inicio_str, hora_fin_str, frecuencia_minutos):
        
    #Ejemplo de uso ("08:00", "20:00", 30)

    # Convertir strings a objetos datetime
    inicio = datetime.strptime(hora_inicio_str, "%H:%M")
    fin = datetime.strptime(hora_fin_str, "%H:%M")
        
    intervalos = []
    minutos_total = (fin.hour * 60 + fin.minute) - (inicio.hour * 60 + inicio.minute)
    
    #Validamos que el tiempo total sea divisible por la frecuencia
    # Si no es divisible, no se puede calcular los intervalos
    if minutos_total % frecuencia_minutos != 0:
        return None
    
    tiempo_actual = inicio
        
    while tiempo_actual < fin:
        siguiente = tiempo_actual + timedelta(minutes=frecuencia_minutos)
        if siguiente > fin:
            break
        # Formatear como strings HH:MM sin segundos, define una tupla con el rando del horario que serian las horas de reserva
        intervalo = (
            tiempo_actual.strftime("%H:%M"),
            siguiente.strftime("%H:%M")
        )
        intervalos.append(intervalo)
        tiempo_actual = siguiente
        
    return intervalos