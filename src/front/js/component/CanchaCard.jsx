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
        <div className="card h-100 shadow" style={{
          borderRadius: '12px',
          transition: 'transform 0.2s'
        }}>
          {cancha.imagen && (
            <div className="card-img-top" style={{
              height: '200px',
              overflow: 'hidden',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <img
                src={cancha.imagen}
                alt={cancha.nombre}
                className="img-fluid w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}

          <div className="card-header bg-success text-white py-3">
            <h5 className="mb-0 fs-5 fw-bold">{cancha.nombre}</h5>
          </div>

          <div className="card-body p-3">
            <p className="mb-2"><strong>Deporte:</strong> {cancha.deporte}</p>

            <div className="mb-3">
              <strong className="d-block mb-2">Días Disponibles:</strong>
              <div className="d-flex flex-wrap gap-2">
                {cancha?.horario?.diasDisponibles ? (
                  cancha.horario.diasDisponibles.split(',').map((dia, index) => (
                    <span key={index} className="badge bg-primary py-2 px-3" style={{ borderRadius: '20px' }}>{dia.trim()}</span>
                  ))
                ) : (
                  <span className="text-danger">Sin días disponibles</span>
                )}
              </div>
            </div>

            <p className="mb-0">
              <strong>Horario: </strong>
              <span className="text ms-2">
                {cancha.horario?.horarioInicio ? cancha.horario.horarioInicio.slice(0, 5) : 'Sin hora'} -
                {cancha.horario?.horarioFin ? cancha.horario.horarioFin.slice(0, 5) : 'Sin hora'}
              </span>
            </p>
          </div>

          <div className="card-footer bg-transparent py-3">
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-warning btn-sm d-flex align-items-center"
                onClick={handleEditClick}
                disabled={true}
                style={{ width: '40px', justifyContent: 'center' }}
              >
                <i className="bi bi-pencil"> Editar </i>
              </button>
              <button
                className="btn btn-outline-danger btn-sm d-flex align-items-center"
                onClick={handleDeleteClick}
                style={{ width: '40px', justifyContent: 'center' }}
              >
                <i className="bi bi-trash"> Eliminar </i>
              </button>
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
