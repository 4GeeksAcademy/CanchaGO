import React, { useState } from 'react';

const CrearCanchaBoton = () => {
    const [showForm, setShowForm] = useState(false);

    const [fieldData, setFieldData] = useState({
        name: '',
        price: '',
        clubEmail: '',
        sport: '',
        startTime: '',
        endTime: '',
        frequency: '',
        days: [],
    });

    const sportsOptions = ['Fútbol', 'Basketball', 'Tennis', 'Pádel'];
    const daysOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFieldData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDaysChange = (e) => {
        const { value, checked } = e.target;
        setFieldData((prev) => {
            if (checked) {
                return { ...prev, days: [...prev.days, value] };
            } else {
                return { ...prev, days: prev.days.filter((day) => day !== value) };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('New field submitted:', fieldData);
        alert('Cancha creada exitosamente!');
        closeModal(); // Hide the form after submit
    };

    const openModal = () => setShowForm(true);
    const closeModal = () => setShowForm(false);

    return (
        <>
            {/* Button to open the form */}
            <div className="d-flex justify-content-center my-5">
                <button className="btn btn-primary" onClick={openModal}>
                    Crear Nueva Cancha
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content p-4">

                            {/* Close Button */}
                            <div className="text-end mb-3">
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={closeModal}
                                ></button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Nombre de la Cancha</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={fieldData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Precio</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="price"
                                        value={fieldData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email del Club</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="clubEmail"
                                        value={fieldData.clubEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Deporte</label>
                                    <select
                                        className="form-select"
                                        name="sport"
                                        value={fieldData.sport}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecciona un deporte</option>
                                        {sportsOptions.map((sport) => (
                                            <option key={sport} value={sport}>{sport}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Hora de Inicio</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        name="startTime"
                                        value={fieldData.startTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Hora de Fin</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        name="endTime"
                                        value={fieldData.endTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Frecuencia</label>
                                    <select
                                        className="form-select"
                                        name="frequency"
                                        value={fieldData.frequency}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecciona una frecuencia</option>
                                        <option value="Una vez">Una vez</option>
                                        <option value="Semanal">Semanal</option>
                                        <option value="Mensual">Mensual</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Días Disponibles</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {daysOptions.map((day) => (
                                            <div key={day} className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={day}
                                                    value={day}
                                                    checked={fieldData.days.includes(day)}
                                                    onChange={handleDaysChange}
                                                />
                                                <label htmlFor={day} className="form-check-label">{day}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit + Cancel Buttons */}
                                <div className="d-flex justify-content-center gap-3">
                                    <button type="submit" className="btn btn-success px-4">
                                        Crear Cancha
                                    </button>
                                    <button type="button" className="btn btn-outline-danger px-4" onClick={closeModal}>
                                        Cancelar
                                    </button>
                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CrearCanchaBoton;