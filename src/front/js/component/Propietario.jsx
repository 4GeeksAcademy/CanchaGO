import React, { useState } from 'react';
import Navbarpropietario from './Navbarpropietario.jsx';
import CrearClubModal from './CrearClubModal.jsx';
import ClubCard from './ClubCard.jsx';

const Propietario = () => {
  const [showCrearClubModal, setShowCrearClubModal] = useState(false);
  const [clubs, setClubs] = useState([]);

  const handleSaveClub = (newClub) => {
    setClubs(prev => [...prev, newClub]);
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