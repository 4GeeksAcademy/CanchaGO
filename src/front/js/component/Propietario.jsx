import React, { useState, useContext, useEffect } from 'react';
import Navbarpropietario from './Navbarpropietario.jsx';
import CrearClubModal from './CrearClubModal.jsx';
import ClubCard from './ClubCard.jsx';
import { Context } from "../store/appContext.js";
import { useAlert } from "../hooks/useAlert.js";


const Propietario = () => {

  const [showCrearClubModal, setShowCrearClubModal] = useState(false);
  const [clubs, setClubs] = useState([]);
  const { store, actions } = useContext(Context);
  const { error, success } = useAlert();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const res = await actions.getClubsByUser();
    if (res.success) {
      //     success(res.message);
    } else {
      //    error(res.message || "Error al obtener los clubes");
    }
  };

  //Funcion para crear un club
  const handleSaveClub = async (newClub) => {

    let response = await actions.createClub(newClub);
    if (response.success) {
      success(response.message);

      fetchClubs(); // Actualizar la lista de clubes después de crear uno

    } else {
      error(response.message || "Error al crear el club");
    }
  };

  //Funcion para eliminar un club
  const handleDeleteClub = async (email) => {

    let response = await actions.deleteClub(email);

    if (response.success) {
      success(response.message);

      fetchClubs(); // Actualizar la lista de clubes después de eliminar unos

    } else {
      error(response.message || "Error al eliminar el club");
    }
  };


  //Funcion para editar un club
  const handleEditClub = async (updatedClub) => {
    let response = await actions.editClub(updatedClub);
    if (response.success) {
      success(response.message);

      fetchClubs(); // Actualizar la lista de clubes después de editar uno

    } else {
      error(response.message || "Error al editar el club");
    }
    setShowCrearClubModal(false);
  }

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
        <h2 className="mb-4" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '36px',
          color: '#2c3e50',
          fontWeight: '700',
          letterSpacing: '1px',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
          marginBottom: '20px'
        }}>Mis Clubes</h2>
        <div className="row">
          {Array.isArray(store.clubs) ? (
            store.clubs.length === 0 ? (
              <p>No has creado clubes aún.</p>
            ) : (
              store.clubs.map((club, index) => (
                <ClubCard
                  key={club.email}
                  club={club}
                  onDelete={handleDeleteClub}
                  onEdit={handleEditClub}
                />
              ))
            )
          ) : (
            <p>No has creado clubes aún.</p>
          )}
        </div>

      </div>
    </>
  );
};

export default Propietario;