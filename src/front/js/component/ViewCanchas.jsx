import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import NavbarCanchas from './NavbarCanchas.jsx';
import CrearCanchaModal from './CrearCanchaModal.jsx';
import CanchaCard from './CanchaCard.jsx';
import { Context } from "../store/appContext.js";
import { useAlert } from "../hooks/useAlert.js";


const ViewCanchas = () => {
  const { clubEmail } = useParams();
  const [club, setClub] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [showCrearCanchaModal, setShowCrearCanchaModal] = useState(false);
  const { store, actions } = useContext(Context);
  const { error, success } = useAlert();

  //Cuando carga el componente
  useEffect(() => {

    //Obtenemos las canchas del club
    const encontrado = store.clubs?.find(c => c.email === clubEmail);
    if (encontrado) {
      setClub(encontrado);
      setCanchas(encontrado.canchas || []);
    }
  }, [store.clubs, clubEmail]);


  //Funcion para crear una cancha
  const handleSaveCancha = async (newCancha) => {

    const response = await actions.createCancha(newCancha);

    if (response.success) {
      success(response.message);
      // Actualización optimista local
      setCanchas(prev => [...prev, { ...newCancha, idCancha: `temp-${Date.now()}` }]);

      // Actualizar el store completo
      await actions.getClubsByUser();

      // Sincronizar con los datos frescos del store
      const updatedClub = store.clubs.find(c => c.email === clubEmail);
      if (updatedClub) {
        setCanchas(updatedClub.canchas || []);
      }
    } else {
      error(response.message || "Error al crear la cancha");
    }
  };


  //Funcion para eliminar una cancha
  const handleDeleteCancha = async (canchaId) => {

    let response = await actions.deleteCancha(canchaId);
    if (response.success) {
      success(response.message);

      // Actualizar el store completo
      store.clubs.forEach((club) => {

        if (club.email === clubEmail) {
          const updatedCanchas = club.canchas.filter(c => c.idCancha !== canchaId);
          setCanchas(updatedCanchas);
          club.canchas = updatedCanchas;
        }
      }
      );

    } else {
      error(response.message || "Error al eliminar la cancha");
    }
  };

  if (!club) return <div className="text-center mt-5">Cargando información del club...</div>;

  return (
    <>
      <NavbarCanchas onOpenCrearCancha={() => setShowCrearCanchaModal(true)} />

      {club && (
        <CrearCanchaModal
          show={showCrearCanchaModal}
          onClose={() => setShowCrearCanchaModal(false)}
          onSave={handleSaveCancha}
          club={club}
        />
      )}

      <div className="container mt-4 px-lg-5">
        <div className="row mb-4 g-4 align-items-start">
          <div className="col-md-6 order-2 order-md-1">
            <h2 className="mb-3 fw-bold">{club.nombre}</h2>
            <p className="text-muted mb-4" style={{ lineHeight: '1.6' }}>{club.descripcion}</p>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {club.deportes.map((sport, index) => (
                <span key={index} className="badge bg-success py-2 px-3" style={{ borderRadius: '20px' }}>{sport}</span>
              ))}
            </div>
          </div>
          <div className="col-md-6 order-1 order-md-2">
            <img
              src={club.imagen}
              alt={club.nombre}
              className="img-fluid rounded-3 shadow"
              style={{
                maxHeight: '250px',
                width: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 px-2">
          <h3 className="m-0">Canchas Disponibles</h3>
          <span className="badge bg-success fs-6 py-2 px-3" style={{ borderRadius: '20px' }}>{canchas.length} canchas</span>
        </div>


        {canchas.length === 0 ? (
          <div className="alert alert-info">
            Este club no tiene canchas registradas todavía.
          </div>
        ) : (
          <div className="row">
            {canchas.map((cancha, index) => (
              <CanchaCard
                key={cancha.idCancha}
                cancha={cancha}
                onDelete={handleDeleteCancha}
                club={club}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewCanchas;