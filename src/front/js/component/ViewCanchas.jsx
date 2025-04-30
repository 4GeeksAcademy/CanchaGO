import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ViewCanchas = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);

  useEffect(() => {
    // Fetch club data using clubId — replace with real API later
    const fetchClub = async () => {
      const storedClubs = JSON.parse(localStorage.getItem('clubs')) || [];
      const foundClub = storedClubs.find(c => c.id === clubId);
      setClub(foundClub);
    };
    fetchClub();
  }, [clubId]);

  if (!club) return <div className="text-center mt-5">Cargando cancha...</div>;

  return (
    <div className="container mt-5">
      <h2>{club.name}</h2>
      <img
        src={club.imageUrl}
        alt={club.name}
        className="img-fluid mb-3"
        style={{ maxHeight: '400px', objectFit: 'cover', borderRadius: '12px' }}
      />
      <p>{club.description}</p>
      <p><strong>Ubicación:</strong> {club.location}</p>
      <p><strong>Teléfono:</strong> {club.phone}</p>
      <p><strong>Correo:</strong> {club.email}</p>
      <p><strong>Google Maps:</strong> <a href={club.googleMapsLink} target="_blank" rel="noopener noreferrer">Ver Mapa</a></p>

      <div>
        <h5>Deportes Disponibles:</h5>
        <div className="d-flex flex-wrap gap-2">
          {club.sports.map((sport, index) => (
            <span key={index} className="badge bg-success">{sport}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewCanchas;
