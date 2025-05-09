// MisReservas.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Badge, Button, Spinner } from 'react-bootstrap';
import Navbar from './NavBar.jsx';
import MisReservasModal from './MisReservasModal.jsx';
import { Context } from '../store/appContext.js';
import '../../styles/MisReservas.css';
import { useAlert } from '../hooks/useAlert.js';
import {
    FaCalendarAlt,
    FaClock,
    FaMoneyBillWave,
    FaTimes,
    FaInfoCircle,
    FaFutbol,
    FaTableTennis
} from 'react-icons/fa';

const MisReservas = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const { error, success } = useAlert();

    useEffect(() => {
        const cargarReservas = async () => {
            setLoading(true);
            let response = await actions.getUserReservations();
            response.success
                ? setLoading(false)
                : error(response.message || 'Error al cargar las reservas');
            setLoading(false);
        };
        cargarReservas();
    }, []);

    const handleVer = (reserva) => {
        setSelectedReserva(reserva);
        setShowModal(true);
    };

    const handleCancel = async (idReserva) => {
        if (!window.confirm('¿Estás seguro que deseas cancelar esta reserva?')) return;
        const res = await actions.cancelReservation(idReserva);
        if (res.success) {
            await actions.getUserReservations();
            success('Reserva cancelada');
        } else {
            error(res.message || 'Error al cancelar');
        }
    };

    if (loading)
        return (
            <div className="loading-screen">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando reservas...</p>
            </div>
        );

    const reservas = store.userReservations || [];
    const ahora = new Date();

    return (
        <>
            <Navbar />
            <section className="reservas-container">
                <div className="reservas-header">
                    <h1>
                        {reservas.length > 0 &&
                            (() => {
                                const deporte = reservas[0].cancha.deporte?.nombre.toLowerCase();
                                if (deporte === 'futbol') return <FaFutbol className="me-2" />;
                                if (['padel', 'tenis'].includes(deporte))
                                    return <FaTableTennis className="me-2" />;
                                return null;
                            })()}
                        Mis Reservas
                    </h1>
                    <Badge bg="dark" pill>
                        {reservas.length} activas
                    </Badge>
                </div>

                {!reservas.length ? (
                    <div className="empty-state">
                        <img src="/empty-reservas.svg" alt="Sin reservas" />
                        <h3>¡No hay reservas activas!</h3>
                        <Button href="/buscar-canchas" variant="primary" size="lg">
                            Reservar Ahora
                        </Button>
                    </div>
                ) : (
                    <div className="reservas-grid">
                        {reservas.map((r) => {
                            // determinar si expiró
                            const [dia, mes, año] = r.fecha.split('/').map(Number);
                            const [hFin, mFin] = r.horaFin.split(':').map(Number);
                            const fechaFin = new Date(año, mes - 1, dia, hFin, mFin);
                            const estaActiva = fechaFin > ahora;

                            return (
                                <div key={r.idReserva} className="reserva-card">
                                    {/* Imagen con overlay */}
                                    <div className="card-image-container">
                                        <img
                                            src={r.cancha.imagen}
                                            alt={r.cancha.nombre}
                                            className="reserva-image"
                                        />
                                        <div className="image-overlay">
                                            <span className="club-overlay">{r.cancha.club?.nombre}</span>
                                        </div>
                                    </div>

                                    <div className="reserva-body">
                                        <h3 className="cancha-name">{r.cancha.nombre}</h3>
                                        <div className="reserva-header">
                                            <Badge
                                                bg={r.estado === 'cancelada' ? 'secondary' : 'success'}
                                                pill
                                            >  {r.estado} </Badge>

                                            {estaActiva ? (
                                                <Badge bg="info" pill>
                                                    Activa
                                                </Badge>
                                            ) : (
                                                <Badge bg="warning" pill>
                                                    Expirada
                                                </Badge>
                                            )}

                                            <Badge bg="dark" >#{r.idReserva}</Badge>
                                        </div>

                                        {/* {estaActiva ? (
                                            <Badge bg="info" pill>
                                                Activa
                                            </Badge>
                                        ) : (
                                            <Badge bg="warning" pill>
                                                Expirada
                                            </Badge>
                                        )} */}


                                        <div className="reserva-details">
                                            <div className="detail-item">
                                                <FaCalendarAlt />
                                                <span>{r.fecha}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FaClock />
                                                <span>
                                                    {r.horaInicio} - {r.horaFin}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <FaMoneyBillWave />
                                                <span>
                                                    ${r.monto} ({r.metodoPago})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="reserva-actions">
                                            <Button
                                                variant="outline-dark"
                                                onClick={() => handleVer(r)}
                                            >
                                                <FaInfoCircle /> Detalles
                                            </Button>
                                            {/* <Button
                                                variant="outline-danger"
                                                onClick={() => handleCancel(r.idReserva)}
                                                disabled={r.estado === 'cancelada'}
                                            >
                                                <FaTimes />{' '}
                                                {r.estado === 'cancelada' ? 'Cancelada' : 'Cancelar'}
                                            </Button> */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <MisReservasModal
                show={showModal}
                onHide={() => setShowModal(false)}
                reserva={selectedReserva}
                onCancel={() => handleCancel(selectedReserva.idReserva)}
            />
        </>
    );
};

export default MisReservas;
