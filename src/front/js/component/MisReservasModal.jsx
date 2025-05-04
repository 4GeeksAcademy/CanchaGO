import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const MisReservasModal = ({
    show,
    onHide,
    reserva,
    hora,
    onCancel
}) => {
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    if (!reserva) return null;

    return (
        <>
            {/* Main Details Modal */}
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>Detalles de Reserva</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <img
                            src={reserva.clubImagen}
                            alt={reserva.clubNombre}
                            className="img-fluid rounded-3 mb-3"
                            style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <div className="reservation-details">
                        <h4 className="mb-3 text-center">{reserva.clubNombre}</h4>
                        <div className="mb-3">
                            <p><strong>Código de Reserva:</strong> {reserva.id}-{hora.replace(':', '')}</p>
                            <p><strong>Cancha:</strong> {reserva.canchaNombre}</p>
                            <p><strong>Fecha:</strong> {reserva.fecha}</p>
                            <p><strong>Hora:</strong> {hora}</p>
                            {reserva.pricePerHour && (
                                <p><strong>Precio:</strong> ${reserva.pricePerHour}</p>
                            )}
                        </div>

                        <div className="alert alert-info mt-4">
                            <i className="fas fa-info-circle me-2"></i>
                            Presente su código de reserva al llegar al club.
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={onHide}>
                        Cerrar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => setShowCancelConfirm(true)}
                    >
                        Cancelar Reserva
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal
                show={showCancelConfirm}
                onHide={() => setShowCancelConfirm(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Cancelación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Estás seguro que deseas cancelar esta reserva?</p>
                    <p className="text-danger">
                        <strong>Esta acción no se puede deshacer.</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowCancelConfirm(false)}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            onCancel(reserva.id, hora);
                            setShowCancelConfirm(false);
                            onHide();
                        }}
                    >
                        Confirmar Cancelación
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MisReservasModal;