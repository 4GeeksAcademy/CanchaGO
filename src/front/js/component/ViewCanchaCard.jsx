import React, { useState } from 'react';
import DisponibilidadModal from './DisponibilidadModal.jsx';
import ReservarModal from './ReservarModal.jsx'; // You'll need to create this component

const ViewCanchaCard = ({ cancha }) => {
    const [showDisponibilidadModal, setShowDisponibilidadModal] = useState(false);
    const [showReservarModal, setShowReservarModal] = useState(false);

    const handleDisponibilidadClick = () => {
        setShowDisponibilidadModal(true);
    };

    const handleDisponibilidadClose = () => {
        setShowDisponibilidadModal(false);
    };

    const handleReservarClick = () => {
        setShowReservarModal(true);
    };

    const handleReservarClose = () => {
        setShowReservarModal(false);
    };

    return (
        <>
            <div className="col-md-4 mb-4">
                <div className="card h-100 shadow" style={{
                    borderRadius: '12px',
                    border: '2px solid #000'
                }}>
                    {cancha.imagenUrl && (
                        <div className="card-img-top" style={{
                            height: '200px',
                            overflow: 'hidden',
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px'
                        }}>
                            <img
                                src={cancha.imagenUrl}
                                alt={cancha.nombre}
                                className="img-fluid w-100 h-100"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    <div className="card-header" style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        borderBottom: '2px solid #000'
                    }}>
                        <h5 className="mb-0">{cancha.nombre}</h5>
                    </div>

                    <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                            <span className="text-muted">Tipo:</span>
                            <span className="text-dark ms-2">{cancha.tipo}</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-muted">Iluminación:</span>
                            {cancha.iluminacion ? (
                                <span className="text-success ms-2">✓ Disponible</span>
                            ) : (
                                <span className="text-danger ms-2">✗ No disponible</span>
                            )}
                        </div>
                        <div className="mb-2">
                            <span className="text-muted">Techada:</span>
                            {cancha.techada ? (
                                <span className="text-success ms-2">✓ Sí</span>
                            ) : (
                                <span className="text-danger ms-2">✗ No</span>
                            )}
                        </div>
                    </div>

                    <div className="card-footer bg-transparent d-flex justify-content-between" style={{
                        borderTop: '1px solid #e0e0e0',
                        gap: '50px',
                    }}>
                        <button
                            className="btn btn-outline-secondary rounded-pill px-5 py-1"
                            onClick={handleDisponibilidadClick}
                        >
                            Ver Detalles
                        </button>
                        <button
                            className="btn btn-primary rounded-pill px-2 py-2"
                            onClick={handleReservarClick}
                        >
                            Reservar
                        </button>
                    </div>
                </div>
            </div>

            {/* Availability Modal */}
            <DisponibilidadModal
                show={showDisponibilidadModal}
                onClose={handleDisponibilidadClose}
                cancha={cancha}
            />

            {/* Booking Modal */}
            <ReservarModal
                show={showReservarModal}
                onClose={handleReservarClose}
                cancha={cancha}
            // reservas={dataFromBackend} para mandar reservas desde el backend
            />
        </>
    );
};

export default ViewCanchaCard;