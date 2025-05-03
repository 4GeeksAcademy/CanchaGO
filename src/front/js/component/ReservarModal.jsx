import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ReservarModal = ({ show, onClose, cancha, reservas = [] }) => {
    const [formData, setFormData] = React.useState({
        date: new Date().toISOString().split('T')[0],
        times: [],
        duration: '1',
        notes: ''
    });

    // Hardcoded Data
    const hardcodedReservas = [
        {
            canchaId: 1,
            date: '2025-05-03',
            times: ['10:00', '11:00']
        },
        {
            canchaId: 1,
            date: '2025-05-03',
            times: ['12:00', '13:00']
        },
        {
            canchaId: 2,
            date: '2025-05-04',
            times: ['14:00']
        },
        {
            canchaId: 2,
            date: '2025-05-03',
            times: ['09:00', '10:00']
        }
    ];
// Para el HardCode
    const reservedTimes = React.useMemo(() => {
        const filtered = hardcodedReservas
            .filter(r => r.date === formData.date && r.canchaId === cancha.id)
            .flatMap(r => r.times);
        return filtered;
    }, [formData.date, cancha.id]);

    // Codigo dyanmico
    // const reservedTimes = React.useMemo(() => {
    //     return reservas
    //         .filter(r => r.date === formData.date && r.canchaId === cancha.id)
    //         .flatMap(r => r.times);
    // }, [formData.date, cancha.id, reservas]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTimeToggle = (slot) => {
        setFormData(prev => {
            const alreadySelected = prev.times.includes(slot);
            return {
                ...prev,
                times: alreadySelected
                    ? prev.times.filter(t => t !== slot)
                    : [...prev.times, slot]
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Reservation submitted:', {
            canchaId: cancha.id,
            ...formData
        });
        onClose();
    };

    const horaInicio = "08:00";
    const horaFin = "22:00";
    const frecuencia = 60;

    const timeSlots = [];
    const [startHour, startMin] = horaInicio.split(":").map(Number);
    const [endHour, endMin] = horaFin.split(":").map(Number);
    let startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (startMinutes < endMinutes) {
        const hours = Math.floor(startMinutes / 60);
        const minutes = startMinutes % 60;
        timeSlots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        startMinutes += parseInt(frecuencia);
    }

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="bg-dark text-white">
                <Modal.Title>Reservar {cancha.nombre}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="mb-3">
                        <Form.Label>Fecha de Reservación</Form.Label>
                        <Form.Control
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]} // Set the minimum date to today
                            max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]} // Max to one year later
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <Form.Label>Selecciona Horarios</Form.Label>
                        <div className="d-flex flex-wrap gap-2">
                            {timeSlots.map(slot => {
                                const selected = formData.times.includes(slot);
                                const reserved = reservedTimes.includes(slot); 
                                return (
                                    <Button
                                        key={slot}
                                        type="button"
                                        variant={selected ? "primary" : "outline-primary"}
                                        onClick={() => !reserved && handleTimeToggle(slot)} 
                                        disabled={reserved} 
                                        style={{ minWidth: '80px', opacity: reserved ? 0.5 : 1 }}
                                        className="rounded-pill py-1"
                                    >
                                        {slot}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-between p-0 px-3 pb-3">
                    <div className="d-flex pt-2 gap-2 w-100">
                        <Button
                            variant="outline-danger"
                            onClick={onClose}
                            className="flex-grow-1 py-2"
                            style={{ fontWeight: '500', borderWidth: '2px' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            className="flex-grow-1 py-2"
                            style={{ fontWeight: '500' }}
                        >
                            Reservar
                        </Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ReservarModal;
