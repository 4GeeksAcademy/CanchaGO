import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { Context } from '../store/appContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt,
    FaClock,
    FaMoneyBillWave,
    FaFilter,
    FaTimes,
    FaSadTear,
    FaBuilding, FaFootballBall
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import Navbarpropietario from './Navbarpropietario.jsx';
import '../../styles/reservaspropietario.css';

const ITEMS_PER_PAGE = 6;

function CustomPagination({ currentPage, totalPages, onPageChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="pagination-container">
            <Button
                variant="link"
                className="pagination-arrow"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                ‹
            </Button>
            {pages.map(p => (
                <Button
                    key={p}
                    variant={p === currentPage ? 'primary' : 'outline-primary'}
                    className={`pagination-item ${p === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(p)}
                >
                    {p}
                </Button>
            ))}
            <Button
                variant="link"
                className="pagination-arrow"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                ›
            </Button>
        </div>
    );
}

export default function ReservasPropietario() {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ fecha: '', estado: 'todas' });
    const [selectedClub, setSelectedClub] = useState('Todos');
    const [selectedCancha, setSelectedCancha] = useState('Todas');
    const [page, setPage] = useState(1);
    const [detail, setDetail] = useState(null);

    const load = useCallback(async () => {
        await actions.getOwnerReservations();
        setLoading(false);
    }, [actions]);

    useEffect(() => { load(); }, [load]);

    const { clubs, canchas, filtered } = useMemo(() => {
        const all = store.ownerReservations || [];
        const clubsSet = ['Todos', ...new Set(all.map(r => r.club.nombre).filter(Boolean))];
        const canchasSet = selectedClub !== 'Todos'
            ? ['Todas', ...new Set(
                all.filter(r => r.club.nombre === selectedClub)
                    .map(r => r.cancha.nombre)
                    .filter(Boolean)
            )]
            : ['Todas'];

        let fdm = '';
        if (filters.fecha) {
            const d = parseISO(filters.fecha);
            fdm = format(d, 'dd/MM/yyyy');
        }

        const fil = all.filter(r => {
            if (fdm && r.fecha !== fdm) return false;
            if (filters.estado !== 'todas' && r.estado !== filters.estado) return false;
            if (selectedClub !== 'Todos' && r.club.nombre !== selectedClub) return false;
            if (selectedCancha !== 'Todas' && r.cancha.nombre !== selectedCancha) return false;
            return true;
        });

        return { clubs: clubsSet, canchas: canchasSet, filtered: fil };
    }, [store.ownerReservations, filters, selectedClub, selectedCancha]);

    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const shown = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const fmt = s => {
        try { return format(parseISO(s), "dd 'de' MMMM yyyy", { locale: esLocale }); }
        catch { return s; }
    };

    const reset = () => {
        setFilters({ fecha: '', estado: 'todas' });
        setSelectedClub('Todos');
        setSelectedCancha('Todas');
        setPage(1);
    };

    return (
        <>
            <Navbarpropietario />
            <Container fluid className="owner-reservations-container">
                <motion.div
                    className="management-header"
                    initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                >
                    <h1>
                        Gestión de Reservas <Badge bg="primary">{filtered.length}</Badge>
                    </h1>
                    <p className="lead">Administra todas tus reservas</p>
                </motion.div>

                <motion.div
                    className="filters-panel"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                    <div className="filters-header">
                        <div className="filters-title"><FaFilter /> Filtros</div>
                        <Button variant="outline-danger" onClick={reset}>
                            <FaTimes /> Limpiar
                        </Button>
                    </div>
                    <div className="filters-grid">
                        <Form.Select
                            value={selectedClub}
                            onChange={e => {
                                setSelectedClub(e.target.value);
                                setSelectedCancha('Todas');
                                setPage(1);
                            }}
                        >
                            {clubs.map(c => <option key={c}>{c}</option>)}
                        </Form.Select>
                        <Form.Select
                            value={selectedCancha}
                            onChange={e => { setSelectedCancha(e.target.value); setPage(1); }}
                            disabled={selectedClub === 'Todos'}
                        >
                            {canchas.map(c => <option key={c}>{c}</option>)}
                        </Form.Select>
                        <Form.Control
                            type="date"
                            value={filters.fecha}
                            onChange={e => {
                                setFilters(f => ({ ...f, fecha: e.target.value }));
                                setPage(1);
                            }}
                        />
                        <Form.Select
                            value={filters.estado}
                            onChange={e => {
                                setFilters(f => ({ ...f, estado: e.target.value }));
                                setPage(1);
                            }}
                        >
                            <option value="todas">Todos</option>
                            <option value="Confirmada">Confirmadas</option>
                            <option value="Cancelada">Canceladas</option>
                        </Form.Select>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="loading-overlay"><Spinner animation="border" /></div>
                ) : shown.length === 0 ? (
                    <motion.div
                        className="empty-reservations-state"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                        <FaSadTear className="empty-icon" />
                        <h3>No hay reservas</h3>
                        <Button onClick={reset}>Reiniciar filtros</Button>
                    </motion.div>
                ) : (
                    <>
                        <div className="reservations-grid">
                            {shown.map(r => (
                                <motion.div
                                    key={r.idReserva}
                                    className="reservation-card"
                                    whileHover={{ y: -5, boxShadow: '0 12px 36px rgba(0,0,0,0.12)' }}
                                    onClick={() => setDetail(r)}
                                >
                                    <div className="card-header-section">
                                        <div className="club-info">
                                            <h4>{r.club.nombre}</h4>
                                            <Badge bg={r.estado === 'Confirmada' ? 'success' : 'danger'}>
                                                {r.estado}
                                            </Badge>
                                        </div>
                                        <h5>{r.cancha.nombre}</h5>
                                        <Badge bg="dark">
                                            {r.idReserva}
                                        </Badge>
                                    </div>
                                    <div className="card-details-section">
                                        <div><FaCalendarAlt /> {fmt(r.fecha)}</div>
                                        <div><FaClock /> {r.horaInicio} - {r.horaFin}</div>
                                        <div><FaMoneyBillWave /> <strong>${r.monto}</strong></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        {total > 1 && (
                            <CustomPagination
                                currentPage={page}
                                totalPages={total}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}

                <AnimatePresence>
                    {detail && (
                        <motion.div
                            className="reservation-detail-modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="modal-content-container"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="modal-header-pro">
                                    <h2>Detalles de Reserva</h2>
                                    <button className="close-modal-btn" onClick={() => setDetail(null)}>×</button>
                                </div>
                                <div className="modal-body-pro">
                                    <div className="modal-item">
                                        <FaCalendarAlt className="modal-icon" />
                                        <div>
                                            <label>Fecha</label>
                                            <p>{fmt(detail.fecha)}</p>
                                        </div>
                                    </div>
                                    <div className="modal-item">
                                        <FaClock className="modal-icon" />
                                        <div>
                                            <label>Horario</label>
                                            <p>{detail.horaInicio} - {detail.horaFin}</p>
                                        </div>
                                    </div>
                                    <div className="modal-item">
                                        <FaBuilding className="modal-icon" />
                                        <div>
                                            <label>Club</label>
                                            <p>{detail.club.nombre}</p>
                                        </div>
                                    </div>
                                    <div className="modal-item">
                                        <FaFootballBall className="modal-icon" />
                                        <div>
                                            <label>Cancha</label>
                                            <p>{detail.cancha.nombre}</p>
                                        </div>
                                    </div>
                                    <div className="modal-item full-width">
                                        <FaMoneyBillWave className="modal-icon" />
                                        <div>
                                            <label>Monto Total</label>
                                            <p className="amount-pro">${detail.monto}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer-pro">
                                    <button className="btn-close-pro" onClick={() => setDetail(null)}>
                                        Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </Container>
        </>
    );
}
