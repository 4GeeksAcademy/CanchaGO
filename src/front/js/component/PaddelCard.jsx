// PaddelCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import { FiMapPin, FiPhone, FiMap } from 'react-icons/fi';
import '../../styles/PaddelCard.css';

const PaddelCard = ({ paddel, selectedSport }) => {
  const navigate = useNavigate();
  const { error } = useAlert();

  const handleViewCanchas = () => {
    navigate(`/club/${encodeURI(paddel.email)}-${selectedSport}/canchas`);
  };

  const handleOpenMap = () => {
    if (paddel.googleMapsLink?.trim()) {
      window.open(paddel.googleMapsLink, '_blank');
    } else {
      error('Enlace de mapa no disponible');
    }
  };

  return (
    <div className="paddel-card">
      <div className="card-media">
        <img
          src={paddel.imagen}
          alt={paddel.nombre}
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay">
          <button className="map-button" onClick={handleOpenMap}>
            <FiMap className="map-icon" />
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{paddel.nombre}</h3>
          <span className="sport-badge">{selectedSport}</span>
        </div>

        <div className="card-meta">
          <div className="meta-item">
            <FiMapPin className="meta-icon" />
            <p className="meta-text">{paddel.direccion}</p>
          </div>
          <div className="meta-item">
            <FiPhone className="meta-icon" />
            <p className="meta-text">{paddel.telefono}</p>
          </div>
        </div>

        <button className="view-button" onClick={handleViewCanchas}>
          <span>Explorar Instalaciones</span>
        </button>
      </div>
    </div>
  );
};

export default PaddelCard;