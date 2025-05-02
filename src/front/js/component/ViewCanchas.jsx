import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavbarCanchas from './NavbarCanchas.jsx';
import CrearCanchaModal from './CrearCanchaModal.jsx';
import CanchaCard from './CanchaCard.jsx';

const ViewCanchas = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [showCrearCanchaModal, setShowCrearCanchaModal] = useState(false);

  useEffect(() => {
    // Hardcoded club data
    const hardcodedClub = {
      id: '1',
      name: 'Club Deportivo Ejemplo',
      description: 'El mejor club deportivo de la ciudad con instalaciones de primera',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Av. Principal 123, Ciudad',
      phone: '+1 234 567 890',
      email: 'info@clubdeportivo.com',
      googleMapsLink: 'https://goo.gl/maps/example',
      sports: ['Fútbol', 'Pádel', 'Tenis']
    };

    // Hardcoded canchas data
    const hardcodedCanchas = [
      {
        id: '1',
        nombre: 'Cancha Principal',
        tipo: 'Fútbol 5',
        iluminacion: true,
        techada: false,
        imagenUrl: 'data:image/jpeg;base64,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',
        diasDisponibles: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        horaInicio: '08:00',
        horaFin: '22:00',
        frecuencia: '60',
        precio: '1500'
      },
      {
        id: '2',
        nombre: 'Cancha de Pádel',
        tipo: 'Pádel',
        iluminacion: true,
        techada: true,
        imagenUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        diasDisponibles: ['Lunes', 'Miércoles', 'Viernes', 'Sábado', 'Domingo'],
        horaInicio: '09:00',
        horaFin: '23:00',
        frecuencia: '60',
        precio: '2000'
      }
    ];

    // Simulate API loading delay
    const timer = setTimeout(() => {
      setClub(hardcodedClub);
      setCanchas(hardcodedCanchas);
    }, 500);

    return () => clearTimeout(timer);
  }, [clubId]);

  const handleSaveCancha = (newCancha) => {
    setCanchas(prev => [...prev, { 
      ...newCancha, 
      id: Date.now().toString() 
    }]);
    setShowCrearCanchaModal(false);
  };

  const handleDeleteCancha = (canchaId) => {
    setCanchas(prev => prev.filter(cancha => cancha.id !== canchaId));
  };

  if (!club) return <div className="text-center mt-5">Cargando información del club...</div>;

  return (
    <>
      <NavbarCanchas onOpenCrearCancha={() => setShowCrearCanchaModal(true)} />
      
      <CrearCanchaModal
        show={showCrearCanchaModal}
        onClose={() => setShowCrearCanchaModal(false)}
        onSave={handleSaveCancha}
      />

      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-md-6">
            <h2 className="mb-3">{club.name}</h2>
            <p className="text-muted">{club.description}</p>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {club.sports.map((sport, index) => (
                <span key={index} className="badge bg-success">{sport}</span>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <img
              src={club.imageUrl}
              alt={club.name}
              className="img-fluid rounded shadow"
              style={{ maxHeight: '200px' }}
            />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Canchas Disponibles</h3>
          <span className="badge bg-success">{canchas.length} canchas</span>
        </div>

        {canchas.length === 0 ? (
          <div className="alert alert-info">
            Este club no tiene canchas registradas todavía.
          </div>
        ) : (
          <div className="row">
            {canchas.map((cancha) => (
              <CanchaCard 
                key={cancha.id} 
                cancha={cancha} 
                onDelete={handleDeleteCancha}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewCanchas;