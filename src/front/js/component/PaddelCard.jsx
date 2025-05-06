import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import { useContext, useState, useEffect } from 'react';

const PaddelCard = ({ paddel, selectedSport }) => {
  const navigate = useNavigate();

  const handleOpenMaps = () => {
    if (paddel.mapsUrl) {
      window.open(paddel.mapsUrl, '_blank');
    }
  };

  const handleImageClick = () => {
    navigate('/miscanchas')
  };
  const handleLooginClick = () => {
    navigate('/loggin')
  };

  const handleViewCanchas = () => {
    navigate(`/club/${encodeURI(paddel.email) + "-" + selectedSport}/canchas`);
  };

  return (
    <div className="card shadow" style={{ borderRadius: '16px', width: '300px' }} >
      <img
        src={paddel.imagen}
        className="card-img-top"
        style={{
          height: '200px',
          objectFit: 'cover',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}
        alt={paddel.nombre}
        onClick={handleViewCanchas}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-1">{paddel.nombre}</h5>
        <p className="card-text mb-2">{paddel.descripcion !== "" ? paddel.descripcion : " Sin Descipción "}</p>

        <strong>Deportes:</strong>
        <div className="d-flex flex-wrap gap-2 mt-1 mb-3">
          {paddel?.deportes?.map((sport, i) => (
            <span key={i} className="badge bg-primary">{sport}</span>
          ))}
        </div>


        <div className="mt-auto d-flex justify-content-between">
          <button className="btn btn-outline-primary btn-sm" onClick={handleViewCanchas}>
            Ver Canchas
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleOpenMaps}>
            Ver en Google Maps
          </button>
        </div>
      </div>
      <div className="card-footer text-muted text-center">
        <small>{paddel.direccion} | {paddel.telefono}</small>
      </div>
    </div>
  );
};



export default PaddelCard;