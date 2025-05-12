import React, { useState, useEffect, useContext } from 'react';
import { Badge, Button, Spinner, Form, Row, Col, Pagination } from 'react-bootstrap';
import Navbar from './NavBar.jsx';
import { Context } from '../store/appContext.js';
import '../../styles/MisReservas.css';
import { useAlert } from '../hooks/useAlert.js';
import {
    FaCalendarAlt, FaClock, FaMoneyBillWave, FaTimes,
    FaInfoCircle, FaFilter, FaSyncAlt, FaSadTear
} from 'react-icons/fa';
import MisReservasModal from './MisReservasModal.jsx';
import CancelacionModal from './CancelacionModal.jsx';

const ITEMS_PER_PAGE = 6;

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        let pages = [];
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    return (
        <Pagination className="justify-content-center mt-4">
            <Pagination.Prev
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            />
            {getPageNumbers().map(page => (
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Pagination.Item>
            ))}
            <Pagination.Next
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            />
        </Pagination>
    );
};

const MisReservas = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const { error, success } = useAlert();

    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        estado: 'todas',
        actividad: 'todas',
        fecha: ''
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await actions.getUserReservations();
            } catch (err) {
                error('Error cargando reservas');
            }
            setLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleClearFilters = () => {
        setFilters({
            estado: 'todas',
            actividad: 'todas',
            fecha: ''
        });
    };

    const parseFecha = (fechaStr) => {
        const [dia, mes, año] = fechaStr.split('/').map(Number);
        return new Date(año, mes - 1, dia);
    };

    const calcularEstadoActividad = (fechaStr, horaFin) => {
        const [dia, mes, año] = fechaStr.split('/').map(Number);
        const [hora, minutos] = horaFin.split(':').map(Number);
        const fechaFin = new Date(año, mes - 1, dia, hora, minutos);
        return fechaFin > new Date() ? 'Activa' : 'Expirada';
    };

    const puedeCancelar = (reserva) => {
        if (reserva.estado === 'Cancelada') return false;
        const [dia, mes, año] = reserva.fecha.split('/').map(Number);
        const [hora, minutos] = reserva.horaInicio.split(':').map(Number);
        const fechaReserva = new Date(año, mes - 1, dia, hora, minutos);
        return (fechaReserva - new Date()) > (3 * 60 * 60 * 1000);
    };

    const reservasFiltradas = store.userReservations?.filter(reserva => {
        const estadoMatch = filters.estado === 'todas' ||
            reserva.estado.toLowerCase() === filters.estado.toLowerCase();

        const actividad = calcularEstadoActividad(reserva.fecha, reserva.horaFin);
        const actividadMatch = filters.actividad === 'todas' ||
            actividad.toLowerCase() === filters.actividad.toLowerCase();

        const fechaReserva = parseFecha(reserva.fecha);
        const fechaFiltro = filters.fecha ? parseFecha(filters.fecha) : null;
        const dateMatch = !fechaFiltro ||
            fechaReserva.toDateString() === fechaFiltro.toDateString();

        return estadoMatch && actividadMatch && dateMatch;
    }) || [];

    const totalPages = Math.ceil(reservasFiltradas.length / ITEMS_PER_PAGE);
    const reservasPagina = reservasFiltradas.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleCancelarReserva = async (idReserva) => {
        try {
            const result = await actions.cancelReservation(idReserva);

            if (result.success) {
                success('Reserva cancelada exitosamente');
                await actions.getUserReservations();
            } else {
                error(result.message || 'Error al cancelar reserva');
            }
        } catch (err) {
            error('Error de conexión');
        }
        setActiveModal(null);
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Cargando reservas...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <section className="reservas-container">
                <div className="reservas-header">
                    <div className="header-content">
                        <h1>
                            <FaCalendarAlt className="me-2" />
                            Mis Reservas
                            <Badge bg="primary" pill className="ms-3">
                                {reservasFiltradas.length}
                            </Badge>
                        </h1>
                    </div>

                    <div className="filtros-section">
                        <div className="filtros-header">
                            <FaFilter className="me-2" />
                            <h5>Filtrar reservas</h5>
                            <Button
                                variant="link"
                                onClick={handleClearFilters}
                                className="ms-auto"
                            >
                                <FaSyncAlt className="me-2" />
                                Limpiar filtros
                            </Button>
                        </div>

                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Estado:</Form.Label>
                                    <Form.Select
                                        value={filters.estado}
                                        onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                                        className="filter-input"
                                    >
                                        <option value="todas">Todas</option>
                                        <option value="Confirmada">Confirmadas</option>
                                        <option value="Cancelada">Canceladas</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Actividad:</Form.Label>
                                    <Form.Select
                                        value={filters.actividad}
                                        onChange={(e) => setFilters({ ...filters, actividad: e.target.value })}
                                        className="filter-input"
                                    >
                                        <option value="todas">Todas</option>
                                        <option value="Activa">Activas</option>
                                        <option value="Expirada">Expiradas</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Fecha:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={filters.fecha.split('/').reverse().join('-')}
                                        onChange={(e) => {
                                            const [año, mes, dia] = e.target.value.split('-');
                                            setFilters({ ...filters, fecha: `${dia}/${mes}/${año}` });
                                        }}
                                        className="filter-input"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="content-wrapper">
                    {reservasPagina.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <FaSadTear />
                            </div>
                            <h3>No se encontraron reservas</h3>
                            <p>Intenta ajustar los filtros de búsqueda</p>
                            <Button
                                variant="outline-primary"
                                onClick={handleClearFilters}
                            >
                                <FaSyncAlt className="me-2" />
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="reservas-grid">
                                {reservasPagina.map((reserva) => {
                                    const actividadEstado = calcularEstadoActividad(reserva.fecha, reserva.horaFin);
                                    const esCancelable = puedeCancelar(reserva);

                                    return (
                                        <div key={reserva.idReserva} className="reserva-card">
                                            <div className="card-image-container">
                                                <img src={reserva.cancha.imagen} alt={reserva.cancha.nombre} />
                                                <div className="card-badges">
                                                    <Badge bg={reserva.estado === 'Confirmada' ? 'success' : 'secondary'}>
                                                        {reserva.estado}
                                                    </Badge>
                                                    <Badge bg={actividadEstado === 'Activa' ? 'info' : 'warning'}>
                                                        {actividadEstado}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="card-content">
                                                <h3>{reserva.cancha.nombre}</h3>
                                                <p className="club-name" style={{ color: "black" }}>{reserva.club.nombre}</p>

                                                <div className="reserva-info">
                                                    <div className="info-item compact-item">
                                                        <FaCalendarAlt className="me-1" />
                                                        <span>{reserva.fecha}</span>
                                                    </div>
                                                    <div className="info-item compact-item">
                                                        <FaClock className="me-1" />
                                                        <span>{reserva.horaInicio} - {reserva.horaFin}</span>
                                                    </div>
                                                    <div className="info-item compact-item">
                                                        <FaMoneyBillWave className="me-1" />
                                                        <span>${reserva.monto} ({reserva.metodoPago})</span>
                                                    </div>
                                                </div>

                                                <div className="card-actions compact-actions">
                                                    <Button
                                                        variant={esCancelable ? 'danger' : 'secondary'}
                                                        disabled={!esCancelable}
                                                        className="action-btn"
                                                        onClick={() => {
                                                            setSelectedReserva(reserva);
                                                            setActiveModal('cancelacion');
                                                        }}
                                                    >
                                                        <FaTimes className="me-1" />
                                                        {esCancelable ? 'Cancelar' : 'No cancelable'}
                                                    </Button>
                                                    <Button
                                                        variant="outline-dark"
                                                        className="action-btn"
                                                        onClick={() => {
                                                            setSelectedReserva(reserva);
                                                            setActiveModal('detalles');
                                                        }}
                                                    >
                                                        <FaInfoCircle className="me-1" />
                                                        Detalles
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                </div>
            </section>

            <MisReservasModal
                show={activeModal === 'detalles'}
                onHide={() => setActiveModal(null)}
                reserva={selectedReserva}
            />

            <CancelacionModal
                show={activeModal === 'cancelacion'}
                reserva={selectedReserva}
                onHide={() => setActiveModal(null)}
                onConfirm={() => handleCancelarReserva(selectedReserva.idReserva)}
            />
        </>
    );
};

export default MisReservas;