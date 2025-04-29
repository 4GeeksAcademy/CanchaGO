import React, { useState } from 'react';

const CrearClubModal = ({ show, onClose }) => {
  const sportsOptions = [
    'Fútbol',
    'Baloncesto',
    'Tenis',
    'Pádel',
  ];

  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    location: '',
    googleMapsLink: '',
    email: '',
    phone: '',
    sports: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClubData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSportsChange = (sport) => {
    setClubData(prev => {
      if (prev.sports.includes(sport)) {
        return {
          ...prev,
          sports: prev.sports.filter(s => s !== sport)
        };
      } else {
        return {
          ...prev,
          sports: [...prev.sports, sport]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New club submitted:', clubData);
    alert('¡Club creado exitosamente!');
    onClose();
    // Reset form
    setClubData({
      name: '',
      description: '',
      location: '',
      googleMapsLink: '',
      email: '',
      phone: '',
      sports: []
    });
  };

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
        <div className="modal-content p-4">
          <div className="text-end mb-3">
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <h3 className="text-center mb-4">Crear Nuevo Club</h3>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre del Club*</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={clubData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono*</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={clubData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción*</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={clubData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Dirección Física*</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={clubData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Enlace de Google Maps*</label>
                <input
                  type="url"
                  className="form-control"
                  name="googleMapsLink"
                  placeholder="https://maps.google.com/..."
                  value={clubData.googleMapsLink}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Email*</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={clubData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Deportes Disponibles*</label>
              <div className="row">
                {sportsOptions.map((sport) => (
                  <div key={sport} className="col-md-4 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`sport-${sport}`}
                        checked={clubData.sports.includes(sport)}
                        onChange={() => handleSportsChange(sport)}
                      />
                      <label className="form-check-label" htmlFor={`sport-${sport}`}>
                        {sport}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3">
              <button type="submit" className="btn btn-primary px-4">
                Crear Club
              </button>
              <button
                type="button"
                className="btn btn-outline-danger px-4"
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