import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import CrearClubModal from './CrearClubModal.jsx';

const ClubCard = ({ club, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleViewDetails = () => {
    navigate(`/Canchas/${club.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(club.id);
    setShowDeleteModal(false);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  const handleEditSave = async (updatedClub) => {
    await onEdit(updatedClub); // Handle the save/edit logic in the parent component
    setShowEditModal(false);
  };

  return (
    <>
      <div className="col-md-4 mb-4 d-flex">
        <div className="card shadow flex-fill" style={{ borderRadius: '16px' }}>
          <img
            src={club.imagen}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
            alt={club.name}
          />
          <div className="card-body d-flex flex-column">
            <h5 className="card-title mb-1">{club.nombre}</h5>
            <p className="card-text mb-2">{club.descripcion}</p>

            <div className="mb-3">
              <strong>Deportes:</strong>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {club.deportes.map((sport, index) => (
                  <span key={index} className="badge bg-primary">{sport}</span>
                ))}
              </div>
            </div>

            <div className="mt-auto d-flex justify-content-between">
              <button className="btn btn-outline-primary btn-sm" onClick={handleViewDetails}>
                Ver Canchas
              </button>
              <button className="btn btn-outline-warning btn-sm" onClick={handleEditClick}>
                Editar
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteClick}>
                Eliminar
              </button>
            </div>
          </div>
          <div className="card-footer text-muted text-center">
            <small>{club.direccion} | {club.telefono}</small>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el club "{club.name}"? Esta acción no se puede deshacer.
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

      {/* Edit Club using CrearCanchaModal */}
      {showEditModal && (
        <CrearClubModal
          show={showEditModal}
          onClose={handleEditClose}
          onSave={handleEditSave}
          clubToEdit={club}
        />
      )}
    </>
  );
};

export default ClubCard;
