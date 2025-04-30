import React, { useState } from 'react';
import Navbarpropietario from './Navbarpropietario.jsx';
import CrearClubModal from './CrearClubModal.jsx';
import ClubCard from './ClubCard.jsx';

const Propietario = () => {
  const [showCrearClubModal, setShowCrearClubModal] = useState(false);
  const [clubs, setClubs] = useState([
    {
      id: '1',
      name: 'Club Deportivo Ejemplo',
      description: 'El mejor club deportivo de la ciudad',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Av. Principal 123',
      phone: '555-1234',
      sports: ['Fútbol', 'Pádel', 'Tenis']
    }
  ]);

  const handleSaveClub = (newClub) => {
    setClubs(prev => [...prev, { ...newClub, id: Date.now().toString() }]);
    setShowCrearClubModal(false);
  };

  const handleDeleteClub = (clubId) => {
    setClubs(prev => prev.filter(club => club.id !== clubId));
  };

  return (
    <>
      <Navbarpropietario
        onOpenCrearClub={() => setShowCrearClubModal(true)}
      />

      {showCrearClubModal && (
        <CrearClubModal
          show={showCrearClubModal}
          onClose={() => setShowCrearClubModal(false)}
          onSave={handleSaveClub}
        />
      )}

      <div className="container mt-4">
        <h2 className="mb-4">Mis Clubes</h2>
        <div className="row">
          {clubs.length === 0 ? (
            <p>No has creado clubes aún.</p>
          ) : (
            clubs.map((club, index) => (
              <ClubCard 
                key={index} 
                club={club} 
                onDelete={handleDeleteClub}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Propietario;