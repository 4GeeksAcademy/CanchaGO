import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const Disponibilidad = ({ show, onClose, cancha }) => {
  const hasReservations = cancha.reservas && cancha.reservas.length > 0;

  const formatHora = h => h ? h.slice(0, 5) : '';

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '1.5rem', color: 'white' }}>
          Disponibilidad de {cancha?.nombre}
        </Modal.Title>
        <button type="button" className="modal-close-btn" onClick={onClose} style={{ fontSize: '2.5rem', color: '#333' }}>
          &times;
        </button>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Días disponibles:</strong> {cancha?.horario?.diasDisponibles?.split(',').map(d => d.trim()).join(', ') || 'No definidos'}</p>
        <p><strong>Horario:</strong> {formatHora(cancha.horario?.horarioInicio)} - {formatHora(cancha.horario?.horarioFin)}</p>
        <p><strong>Frecuencia:</strong> Cada {cancha.horario.frecuencia} </p>
        <p><strong>Precio por turno:</strong> ${cancha.precio}</p>

        {hasReservations ? (
          <>
            <h5>Horarios Reservados:</h5>
            <ul>
              {cancha.reservas.map((reserva, index) => (
                <li key={index}>
                  {reserva.fecha} - {reserva.horaInicio} a {reserva.horaFin}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p><strong>¡Esta cancha está disponible en los horarios indicados!</strong></p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Disponibilidad;
