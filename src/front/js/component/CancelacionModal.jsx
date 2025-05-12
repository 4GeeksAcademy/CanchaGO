// CancelacionModal.jsx
import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaMoneyBillWave, FaClock } from 'react-icons/fa';

const CancelacionModal = ({ show, reserva, onHide, onConfirm }) => {
    const calcularTiempoRestante = () => {
        if (!reserva || !reserva.fecha || !reserva.horaInicio) return 0;

        try {
            // 1. Parsear fecha en formato dd/mm/aaaa
            const [dia, mes, año] = reserva.fecha.split('/').map(Number);
            const [hora, minutos] = reserva.horaInicio.split(':').map(Number);

            // 2. Crear objeto Date (meses son 0-based)
            const fechaReserva = new Date(año, mes - 1, dia, hora, minutos);

            // 3. Obtener fecha actual en la misma zona horaria
            const ahora = new Date();

            // 4. Calcular diferencia en milisegundos
            const diferenciaMs = fechaReserva - ahora;

            // 5. Convertir a horas
            return Math.floor(diferenciaMs / (1000 * 60 * 60));

        } catch (error) {
            console.error("Error calculando tiempo:", error);
            return 0;
        }
    };

    // 6. Validación precisa (>= 3 horas)
    const permiteReembolso = calcularTiempoRestante() >= 3;
    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="text-danger">
                    <FaExclamationTriangle className="me-2" />
                    Confirmar Cancelación
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {reserva && (
                    <div className="cancelacion-content">
                        <Alert variant="warning">
                            Estás cancelando la reserva <strong>#{reserva.idReserva}</strong>
                        </Alert>

                        <div className="reserva-detalle">
                            <h5>{reserva.cancha.nombre}</h5>
                            <div className="detalle-item">
                                <span>Fecha:</span>
                                <strong>{reserva.fecha}</strong>
                            </div>
                            <div className="detalle-item">
                                <span>Horario:</span>
                                <strong>{reserva.horaInicio} - {reserva.horaFin}</strong>
                            </div>
                            <div className="detalle-item">
                                <span>Monto:</span>
                                <strong>${reserva.monto}</strong>
                            </div>
                        </div>

                        {permiteReembolso ? (
                            <Alert variant="success">
                                <FaMoneyBillWave className="me-2" />
                                Reembolso disponible ({calcularTiempoRestante()}h restantes)
                            </Alert>
                        ) : (
                            <Alert variant="danger">
                                <FaClock className="me-2" />
                                {calcularTiempoRestante() > 0
                                    ? `Mínimo 3h requeridas (${calcularTiempoRestante()}h restantes)`
                                    : "La reserva ya ocurrió"}
                            </Alert>
                        )}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Volver
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Confirmar Cancelación
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CancelacionModal;