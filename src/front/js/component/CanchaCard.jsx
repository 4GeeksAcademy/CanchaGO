import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import CrearCanchaModal from './CrearCanchaModal.jsx';
import DisponibilidadModal from './DisponibilidadModal.jsx';

const CanchaCard = ({ cancha, onDelete, onEdit, club }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisponibilidadModal, setShowDisponibilidadModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(cancha.idCancha);
    setShowDeleteModal(false);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  const handleEditSave = (updatedCancha) => {
    onEdit(updatedCancha);
    setShowEditModal(false);
  };

  const handleDisponibilidadClick = () => {
    setShowDisponibilidadModal(true);
  };

  const handleDisponibilidadClose = () => {
    setShowDisponibilidadModal(false);
  };

  return (
    <>
      <div className="col-md-4 mb-4">
        <div className="card h-100 shadow" style={{ borderRadius: '12px' }}>
          {cancha.imagen && (
            <div className="card-img-top" style={{ height: '180px', overflow: 'hidden' }}>
              <img
                src={cancha.imagen}
                alt={cancha.nombre}
                className="img-fluid w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}

          <div className="card-header bg-success text-white">
            <h5 className="mb-0">{cancha.nombre}</h5>
          </div>
          <div className="card-body">
            <p className="mb-2"><strong>Deporte:</strong> {cancha.deporte}</p>
            <p className="mb-2">
              <strong>Días Disponible:</strong>
              {cancha?.horario?.diasDisponibles ? (
                cancha.horario.diasDisponibles.split(',').map((dia, index) => (
                  <span key={index} className="badge bg-primary mx-1">{dia.trim()}</span>
                ))
              ) : (
                <span className="text-danger ms-2">✗ Sin días disponibles</span>
              )}
            </p>
            <p className="mb-3">
              <strong>Horario: </strong>
              <span className="text ms-2">
                * {cancha.horario && cancha.horario.horarioInicio ? cancha.horario.horarioInicio.slice(0, 5) : 'Sin hora'} -
              </span>
              <span className="text ms-2">
                {cancha.horario && cancha.horario.horarioFin ? cancha.horario.horarioFin.slice(0, 5) : 'Sin hora'}
              </span>
            </p>
          </div>
          <div className="card-footer bg-transparent">
            <div className="d-flex justify-content-between">
              {/* <button
                className="btn btn-outline-success btn-sm"
                onClick={handleDisponibilidadClick}
              >
                Ver Disponibilidad
              </button> */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={handleEditClick}
                  disabled={true}
                >
                  Editar
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleDeleteClick}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar la cancha "{cancha.nombre}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Cancha Modal */}
      {club && (
        <CrearCanchaModal
          show={showEditModal}
          onClose={handleEditClose}
          onSave={handleEditSave}
          canchaToEdit={cancha}
          club={club}
        />
      )}

      {/* Ver Disponibilidad Modal
      <DisponibilidadModal
        show={showDisponibilidadModal}
        onClose={handleDisponibilidadClose}
        cancha={cancha} 
      /> */}
    </>
  );
};

export default CanchaCard;
