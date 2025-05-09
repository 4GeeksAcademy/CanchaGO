// PaddelCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import '../../styles/PaddelCard.css';

const PaddelCard = ({ paddel, selectedSport }) => {
  const navigate = useNavigate();
  const { error } = useAlert();

  const handleOpenMaps = () => {
    const link = paddel.googleMapsLink;
    if (link?.trim() && link !== 'Sin Link') {
      window.open(link, '_blank');
    } else {
      error('Enlace de mapa no disponible');
    }
  };

  const handleViewCanchas = () => {
    navigate(`/club/${encodeURI(paddel.email)}-${selectedSport}/canchas`);
  };

  return (
    <div className="card hover-card">
      <div className="image-container">
        <img
          src={paddel.imagen}
          className="card-image"
          alt={paddel.nombre}
          onClick={handleViewCanchas}
        />
        <div className="sport-overlay">{selectedSport}</div>
      </div>

      <div className="card-body">
        <h5 className="card-title">{paddel.nombre}</h5>
        <p className="card-description">
          {paddel.descripcion || "Descripción no disponible"}
        </p>

        <div className="sports-container">
          <strong>Deportes:</strong>
          <div className="badges-container">
            {paddel.deportes?.map((sport, i) => (
              <span key={i} className="sport-badge">{sport}</span>
            ))}
          </div>
        </div>

        <div className="buttons-container">
          <button className="btn btn-primary" onClick={handleViewCanchas}>
            Ver Canchas
          </button>
          <button className="btn btn-secondary" onClick={handleOpenMaps}>
            Mapa
          </button>
        </div>
      </div>

      <div className="card-footer">
        <div className="club-info">
          <p className="address">
            <i className="bi bi-geo-alt"></i> {paddel.direccion}
          </p>
          <p className="phone">
            <i className="bi bi-telephone"></i> {paddel.telefono}</p>
        </div>
      </div>
    </div>
  );
};

export default PaddelCard;
