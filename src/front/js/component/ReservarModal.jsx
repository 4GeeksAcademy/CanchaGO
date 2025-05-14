// ReservarModal.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Context } from '../store/appContext';
import { useAlert } from '../hooks/useAlert.js';
import '../../styles/reservarmodal.css';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

const ReservarModal = ({ show, onClose, cancha }) => {
    const { store, actions } = useContext(Context);
    const { error } = useAlert();

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayRaw = `${yyyy}-${mm}-${dd}`;

    const [rawDate, setRawDate] = useState(todayRaw);
    const formattedDate = rawDate.split('-').reverse().join('/');

    const [slots, setSlots] = useState([]);
    const [selected, setSelected] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Carga de horarios
    useEffect(() => {
        if (!show) return;
        setLoading(true);
        actions.clearHorariosCancha();
        actions.getHorariosCancha(cancha.idCancha, formattedDate)
            .then(res => {
                if (res.success) {
                    setSlots(store.horarios_cancha.horarios_disponibles || []);
                } else {
                    error(res.message);
                    setSlots([]);
                }
            })
            .finally(() => setLoading(false));
    }, [show, rawDate]);

    useEffect(() => {
        if (show) {
            setSelected([]);
            setShowConfirm(false);
        }
    }, [show]);

    // Filtrado
    const displaySlots = useMemo(() => {
        const safeSlots = Array.isArray(slots) ? slots : [];
        if (rawDate === todayRaw) {
            const now = new Date();
            const threshold = new Date(now.getTime() + 60 * 60 * 1000);
            return safeSlots.filter(slot => {
                const [h, m] = slot.split(':').map(Number);
                const slotDate = new Date(`${rawDate}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
                return slotDate >= threshold;
            });
        }
        return safeSlots;
    }, [rawDate, slots]);

    const toggleSlot = slot => {
        setSelected(prev =>
            prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
        );
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!selected.length) return error('Selecciona al menos un horario');
        setShowConfirm(true);
    };

    const handleBack = () => {
        setSelected([]);
        setShowConfirm(false);
    };

    const confirm = async () => {
        const freqStr = cancha?.horario?.frecuencia;
        let freqMin = freqStr?.endsWith('h')
            ? parseInt(freqStr, 10) * 60
            : freqStr?.endsWith('min')
                ? parseInt(freqStr, 10)
                : null;

        if (!freqMin) return error('Frecuencia inválida: ' + freqStr);

        const monto = selected.length * (cancha.precio ?? 0);
        const data = {
            idCancha: cancha.idCancha,
            nombreCancha: cancha.nombre,
            fecha: formattedDate,
            slots: selected,
            frecuencia: freqMin,
            monto
        };

        try {
            const sessionId = await actions.createCheckoutSession(data);
            const stripe = await stripePromise;
            const result = await stripe.redirectToCheckout({ sessionId });
            if (result?.error) throw result.error;
        } catch (e) {
            error(e.message);
            onClose();
        }
    };

    return (
        <>
            <Modal
                show={show && !showConfirm}
                onHide={onClose}
                centered
                dialogClassName="reservation-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '1.5rem', color: 'white' }}>
                        Reservar {cancha.nombre} para el {formattedDate}
                    </Modal.Title>
                    <button type="button" className="modal-close-btn" onClick={onClose} style={{ fontSize: '2.5rem', color: '#333' }}>
                        &times;
                    </button>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha de reserva</Form.Label>
                            <Form.Control
                                type="date"
                                value={rawDate}
                                onChange={e => setRawDate(e.target.value)}
                                min={todayRaw}
                                max={new Date(new Date().setFullYear(yyyy + 1))
                                    .toISOString().split('T')[0]}
                                required
                            />
                        </Form.Group>

                        <div className="slots-grid">
                            {loading && (
                                <div className="loading-spinner">
                                    <Spinner animation="border" />
                                </div>
                            )}
                            {!loading && displaySlots.map(slot => (
                                <button
                                    key={slot}
                                    type="button"
                                    aria-pressed={selected.includes(slot)}
                                    className={`slot-button ${selected.includes(slot) ? 'selected' : ''}`}
                                    onClick={() => toggleSlot(slot)}
                                >
                                    {slot}
                                </button>
                            ))}
                            {!loading && !displaySlots.length && (
                                <div className="no-slots">No hay horarios disponibles.</div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="link" onClick={onClose}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={!selected.length}>
                            Revisar reserva
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal >

            <Modal
                show={showConfirm}
                onHide={handleBack}
                centered
                dialogClassName="confirmation-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '1.5rem', color: 'white' }}>
                        Confirmar Reserva
                    </Modal.Title>
                    <button type="button" className="modal-close-btn" onClick={onClose} style={{ fontSize: '2.5rem', color: '#333' }}>
                        &times;
                    </button>
                </Modal.Header>
                <Modal.Body className="confirmation-details">
                    <p><strong>Fecha:</strong> {formattedDate}</p>
                    <div className="confirmation-slots">
                        {selected.map(slot => (
                            <span key={slot} className="slot-badge">{slot}</span>
                        ))}
                    </div>
                    <p className="total-price"><strong>Total:</strong> ${(selected.length * (cancha.precio ?? 0)).toFixed(2)}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleBack}>Volver</Button>
                    <Button variant="success" onClick={confirm}>Confirmar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ReservarModal;
