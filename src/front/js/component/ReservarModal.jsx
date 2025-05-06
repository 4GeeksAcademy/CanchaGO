import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Context } from '../store/appContext';
import { useAlert } from '../hooks/useAlert.js';
import '../../styles/reservarmodal.css';

const ReservarModal = ({ show, onClose, cancha, onReserve }) => {
    const { store, actions } = useContext(Context);
    const { success, error } = useAlert();

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
    const pricePerHour = 20000;

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
            const threshold = new Date(now.getTime() + 2 * 60 * 60 * 1000);
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

    const confirm = () => {
        const reserva = { idCancha: cancha.idCancha, fecha: formattedDate, times: selected, total: selected.length * pricePerHour };
        onReserve(reserva);
        setShowConfirm(false);
        onClose();
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
                    <p><strong>Total:</strong> ${selected.length * pricePerHour}</p>
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
