import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import NavbarSinFiltro from './NavbarSinFiltro.jsx';
import MisReservasModal from './MisReservasModal.jsx';

const MisReservas = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [selectedHora, setSelectedHora] = useState(null);
    const [reservas, setReservas] = useState([
        {
            id: 1,
            clubNombre: 'Club A',
            clubImagen: 'https://example.com/club-a.jpg',
            canchaNombre: 'Cancha 1',
            fecha: '2025-05-05',
            times: ['10:00', '11:00'],
            pricePerHour: 20000
        },
        {
            id: 2,
            clubNombre: 'Club B',
            clubImagen: 'https://example.com/club-b.jpg',
            canchaNombre: 'Cancha 2',
            fecha: '2025-05-06',
            times: ['09:00'],
            pricePerHour: 18000
        }
    ]);

    const handleVerReserva = (reserva, hora) => {
        setSelectedReserva(reserva);
        setSelectedHora(hora);
        setShowModal(true);
    };

    const handleCancelReserva = (reservaId, hora) => {
        setReservas(prev =>
            prev.map(r => {
                if (r.id === reservaId) {
                    return {
                        ...r,
                        times: r.times.filter(t => t !== hora)
                    };
                }
                return r;
            }).filter(r => r.times.length > 0) // Remove reservation if no times left
        );
    };

    return (
        <>
            <NavbarSinFiltro />
            <div className="container my-4">
                <h2 className="mb-4">Mis Reservas</h2>

                {reservas.flatMap(r => r.times).length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {reservas.flatMap((reserva) =>
                            reserva.times.map((hora, idx) => (
                                <div className="col" key={`${reserva.id}-${hora}-${idx}`}>
                                    <Card className="h-100 shadow-sm border-0 rounded-4">
                                        <Card.Img
                                            variant="top"
                                            src={reserva.clubImagen}
                                            alt={reserva.clubNombre}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                            className="rounded-top-4"
                                        />
                                        <Card.Body className="d-flex flex-column justify-content-between">
                                            <div>
                                                <Card.Title className="text-center fw-bold">
                                                    {reserva.clubNombre}
                                                </Card.Title>
                                                <Card.Text className="text-center text-muted">
                                                    <span><strong>Cancha:</strong> {reserva.canchaNombre}</span><br />
                                                    <span><strong>Fecha:</strong> {reserva.fecha}</span><br />
                                                    <span><strong>Hora:</strong> {hora}</span><br />
                                                    {reserva.pricePerHour && (
                                                        <span><strong>Precio:</strong> ${reserva.pricePerHour}</span>
                                                    )}
                                                </Card.Text>

                                            </div>
                                            <Button
                                                variant="primary"
                                                className="mt-3 rounded-pill"
                                                onClick={() => handleVerReserva(reserva, hora)}
                                            >
                                                Ver Reserva
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <h4 className="text-muted">No tienes reservas activas</h4>
                        <Button variant="outline-primary" className="mt-3">
                            Buscar Canchas
                        </Button>
                    </div>
                )}
            </div>

            <MisReservasModal
                show={showModal}
                onHide={() => setShowModal(false)}
                reserva={selectedReserva}
                hora={selectedHora}
                onCancel={handleCancelReserva}
            />
        </>
    );
};

export default MisReservas;