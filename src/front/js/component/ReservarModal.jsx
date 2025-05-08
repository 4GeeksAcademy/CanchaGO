import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Context } from '../store/appContext';
import { useAlert } from '../hooks/useAlert.js';
import '../../styles/reservarmodal.css';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

const ReservarModal = ({ show, onClose, cancha, onReserve }) => {
    const { store, actions } = useContext(Context);
    const { success, error } = useAlert();
    const navigate = useNavigate();

    // Fecha raw de hoy (YYYY-MM-DD) usando hora local sin toISOString
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayRaw = `${yyyy}-${mm}-${dd}`;

    const [rawDate, setRawDate] = useState(todayRaw);
    const formattedDate = rawDate.split('-').reverse().join('/'); // dd/mm/yyyy

    const [slots, setSlots] = useState([]);
    const [selected, setSelected] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);

    // Carga de slots al abrir modal o cambiar fecha
    useEffect(() => {
        if (!show) return;
        setSelected([]);
        setSlots([]);
        actions.clearHorariosCancha();
        actions.getHorariosCancha(cancha.idCancha, formattedDate)
            .then(res => {
                if (res.success) {
                    setSlots(store.horarios_cancha.horarios_disponibles);
                } else {
                    error(res.message);
                    setSlots([]);
                }
            });
    }, [show, rawDate, cancha.idCancha]);

    // Filtra slots hoy con +2h, otros días muestra todos
    const displaySlots = useMemo(() => {
        if (rawDate === todayRaw) {
            const now = new Date();
            const threshold = new Date(now.getTime() + 1 * 60 * 60 * 1000);
            return slots.filter(slot => {
                const [h, m] = slot.split(':').map(Number);
                const slotDate = new Date(`${rawDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
                return slotDate >= threshold;
            });
        }
        return slots;
    }, [rawDate, slots]);

    const toggleSlot = slot => {
        setSelected(prev =>
            prev.includes(slot)
                ? prev.filter(s => s !== slot)
                : [...prev, slot]
        );
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!selected.length) return error('Selecciona al menos un horario');
        setShowConfirm(true);
    };

    const confirm = async () => {
        // 1) Extrae la frecuencia en minutos
        const freqStr = cancha?.horario?.frecuencia;
        let freqMin;

        if (freqStr?.endsWith('h')) {
            freqMin = parseInt(freqStr, 10) * 60;
        } else if (freqStr?.endsWith('min')) {
            freqMin = parseInt(freqStr, 10);
        } else {
            error('Frecuencia inválida: ' + freqStr);
            return;
        }
        // 2) Prepara la data con todas las franjas
        const reservaData = {
            idCancha: cancha.idCancha,
            nombreCancha: cancha.nombre,
            fecha: formattedDate,
            slots: selected,       // ej. ["16:00","17:00","18:00"]
            frecuencia: freqMin,        // ej. 60 o 30
            monto: selected.length * cancha.precio
        };

        try {
            const sessionId = await actions.createCheckoutSession(reservaData);
            const stripe = await stripePromise;
            const result = await stripe.redirectToCheckout({ sessionId });
            if (result && result.error) throw result.error;
        } catch (e) {
            error(e.message);
            onClose();
        }
    };

    return (
        <>
            <Modal show={show} onHide={onClose} centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>Reservar {cancha.nombre}</Modal.Title>
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
                                max={
                                    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                                        .toISOString().split('T')[0]
                                }
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Horarios disponibles</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {displaySlots.map(slot => (
                                    <Button
                                        key={slot}
                                        variant={selected.includes(slot) ? 'primary' : 'outline-primary'}
                                        onClick={() => toggleSlot(slot)}
                                        className="rounded-pill py-1"
                                        style={{ minWidth: '80px' }}
                                    >{slot}</Button>
                                ))}
                                {displaySlots.length === 0 && <p>No hay horarios disponibles.</p>}
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="justify-content-end">
                        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={!selected.length}>Siguiente</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>Confirmar Reserva</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Fecha:</strong> {formattedDate}</p>
                    <p><strong>Horas:</strong> {selected.join(', ')}</p>
                    <p><strong>Total:</strong> ${selected.length * cancha.precio}</p>
                </Modal.Body>
                <Modal.Footer className="justify-content-end">
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>Volver</Button>
                    <Button variant="success" onClick={confirm}>Confirmar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ReservarModal;
