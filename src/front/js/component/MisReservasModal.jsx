// MisReservasModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Badge, Alert } from 'react-bootstrap';
import {
    FaCalendarAlt,
    FaClock,
    FaMoneyBillWave,
    FaMapMarkerAlt,
    FaTimes,
    FaInfoCircle,
    FaExclamationTriangle
} from 'react-icons/fa';

const MisReservasModal = ({ show, onHide, reserva, onCancel }) => {
    const [confirming, setConfirming] = useState(false);

    if (!reserva) return null;

    return (
        <>
            <Modal show={show} onHide={onHide} centered size="lg">
                <Modal.Header className="bg-dark text-white">
                    <Modal.Title>
                        <FaInfoCircle className="me-2" />
                        Detalles de Reserva
                    </Modal.Title>
                    <button type="button" className="modal-close-btn" onClick={onHide} style={{ fontSize: '2.5rem', color: '#333' }}>
                        &times;
                    </button>
                </Modal.Header>

                <Modal.Body>
                    <div className="reserva-meta">
                        <div className="reserva-meta-item">
                            <Badge bg="dark" className="mb-3" style={{
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                            }}>#{reserva.idReserva}</Badge>
                            <h3>{reserva.cancha.nombre}</h3>
                        </div>
                        <div className="club-info ">
                            <Badge bg="primary club-name">{reserva.club.nombre}</Badge>
                            <Badge bg="secondary club-name">{reserva.deporte}</Badge>
                        </div>
                    </div>

                    <div className="detail-grid">
                        <div className="detail-item">
                            <FaCalendarAlt className="text-primary" />
                            <div>
                                <small>FECHA</small>
                                <p>{reserva.fecha}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <FaClock className="text-primary" />
                            <div>
                                <small>HORARIO</small>
                                <p>{reserva.horaInicio} - {reserva.horaFin}</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <FaMoneyBillWave className="text-primary" />
                            <div>
                                <small>MONTO</small>
                                <p>${reserva.monto} ({reserva.metodoPago})</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <FaMapMarkerAlt className="text-primary" />
                            <div>
                                <small>UBICACIÓN</small>
                                <p>{reserva.club.direccion}</p>
                            </div>
                        </div>
                    </div>

                    <Alert variant="info" className="mt-4">
                        <FaExclamationTriangle className="me-2" />
                        Presenta este código al llegar al establecimiento
                    </Alert>
                </Modal.Body>

                <Modal.Footer className="justify-content-between">
                    <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                    {/* {reserva.estado !== 'cancelada' && (
                        <Button variant="danger" onClick={() => setConfirming(true)}>
                            Cancelar Reserva
                        </Button>
                    )} */}
                </Modal.Footer>
            </Modal>

            <Modal show={confirming} onHide={() => setConfirming(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Cancelación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <FaExclamationTriangle className="text-danger h1 mb-3" />
                        <h4>¿Cancelar reserva #{reserva.idReserva}?</h4>
                        <p className="text-muted">
                            Esta acción no se puede deshacer. El reembolso estará sujeto a las políticas del club.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setConfirming(false)}>
                        Volver
                    </Button>
                    <Button variant="danger" onClick={() => { onCancel(); setConfirming(false); onHide(); }}>
                        Confirmar Cancelación
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MisReservasModal;