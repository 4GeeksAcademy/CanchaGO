import React, { useState, useEffect } from 'react';

const CrearClubModal = ({ show, onClose, onSave, clubToEdit }) => {

    const DEFAULT_IMAGE_URL =
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXn8_1fUMHpbujy0wY5JANA1_MPUeq-JQPYQ&s';
    const sportsOptions = ['Futbol', 'Tenis', 'Padel'];

    const [clubData, setClubData] = useState({
        nombre: '',
        descripcion: '',
        direccion: '',
        googleMapsLink: '',
        email: '',
        telefono: '',
        imagen: '',
        deportes: []
    });

    useEffect(() => {
        if (clubToEdit) {
            setClubData({
                nombre: clubToEdit.nombre || '',
                descripcion: clubToEdit.descripcion || '',
                direccion: clubToEdit.direccion || '',
                googleMapsLink: clubToEdit.googleMapsLink || '',
                email: clubToEdit.email || '',
                telefono: clubToEdit.telefono || '',
                imagen: clubToEdit.imagen || '',
                deportes: clubToEdit.deportes || []
            });
        }
    }, [clubToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClubData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSportsChange = (sport) => {
        setClubData((prev) => {
            const updated = prev.deportes.includes(sport)
                ? prev.deportes.filter((s) => s !== sport)
                : [...prev.deportes, sport];
            return { ...prev, deportes: updated };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...clubData,
            imagen: clubData.imagen.trim() || DEFAULT_IMAGE_URL
        };

        //Validamos campos antes de enviar
        if (validateFields()) {
            onSave(finalData);
            onClose();
        }


        if (!clubToEdit) {
            setClubData({
                nombre: '',
                descripcion: '',
                direccion: '',
                googleMapsLink: '',
                email: '',
                telefono: '',
                imagen: '',
                deportes: []
            });
        }
    };

    //Funcion para valdiar campos del formulario
    const validateFields = () => {
        const requiredFields = ['nombre', 'telefono', 'email'];
        for (const field of requiredFields) {
            if (!clubData[field]) {
                error(`El campo ${field} es obligatorio.`);
                return false;
            }
        }
        if (clubData.deportes.length === 0) {
            error('Debes seleccionar al menos un deporte.');
            return false;
        }
        return true;
    }

    if (!show) return null;

    return (
        <div
            className="modal show fade d-block"
            tabIndex="-1"
            role="dialog"
            style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1050,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content rounded-3 shadow-lg p-4">
                    {/* Modal Header */}
                    <div className="modal-header border-0 mb-3 align-items-center">
                        <h3 className="modal-title text-uppercase fw-bold text-primary">
                            {clubToEdit ? 'Editar Club' : 'Crear Nuevo Club'}
                        </h3>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    {/* Modal Body */}
                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="nombre" className="form-label">
                                    Nombre del Club <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    className="form-control"
                                    value={clubData.nombre}
                                    onChange={handleChange}
                                    placeholder=""
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="telefono" className="form-label">
                                    Teléfono <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    className="form-control"
                                    value={clubData.telefono}
                                    onChange={handleChange}
                                    placeholder=""
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label htmlFor="descripcion" className="form-label">
                                    Descripción
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    className="form-control"
                                    rows="3"
                                    value={clubData.descripcion}
                                    onChange={handleChange}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="direccion" className="form-label">
                                    Dirección Física
                                </label>
                                <input
                                    type="text"
                                    id="direccion"
                                    name="direccion"
                                    className="form-control"
                                    value={clubData.direccion}
                                    onChange={handleChange}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="googleMapsLink" className="form-label">
                                    Enlace Google Maps
                                </label>
                                <input
                                    type="url"
                                    id="googleMapsLink"
                                    name="googleMapsLink"
                                    className="form-control"
                                    value={clubData.googleMapsLink}
                                    onChange={handleChange}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    value={clubData.email}
                                    onChange={handleChange}
                                    placeholder=""
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="imagen" className="form-label">
                                    Imagen (URL) <small className="text-muted">Opcional</small>
                                </label>
                                <input
                                    type="url"
                                    id="imagen"
                                    name="imagen"
                                    className="form-control"
                                    value={clubData.imagen}
                                    onChange={handleChange}
                                    placeholder=""
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">Deportes</label>
                                <div className="d-flex gap-3 flex-wrap">
                                    {sportsOptions.map((sport) => (
                                        <div key={sport} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`sport-${sport}`}
                                                checked={clubData.deportes.includes(sport)}
                                                onChange={() => handleSportsChange(sport)}
                                            />
                                            <label
                                                className="form-check-label text-capitalize"
                                                htmlFor={`sport-${sport}`}
                                            >
                                                {sport}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer border-0 mt-4 justify-content-center">
                            <button type="submit" className="btn btn-primary px-5">
                                {clubToEdit ? 'Guardar Cambios' : 'Crear Club'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-5"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearClubModal;
