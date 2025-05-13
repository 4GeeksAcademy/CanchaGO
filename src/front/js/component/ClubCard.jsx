import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import CrearClubModal from './CrearClubModal.jsx';

const ClubCard = ({ club, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleViewDetails = () => {
    navigate(`/Canchas/${club.email}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    await onDelete(club.email);
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
      <div className="col-md-4 mb-4 d-flex" style={{ transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div className="card shadow flex-fill" style={{
          borderRadius: '16px',
          transition: 'transform 0.2s',
          minHeight: '420px'
        }}>
          <img
            src={club.imagen}
            className="card-img-top"
            style={{
              height: '200px',
              objectFit: 'cover',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              width: '100%'
            }}
            alt={club.name}
          />
          <div className="card-body d-flex flex-column p-3">
            <h5 className="card-title mb-2 fs-5 fw-bold">{club.nombre}</h5>
            <p className="card-text mb-3 text-muted" style={{ fontSize: '0.9rem' }}>{club.descripcion}</p>

            <div className="mb-3">
              <strong className="d-block mb-2">Deportes:</strong>
              <div className="d-flex flex-wrap gap-2">
                {club.deportes.map((sport, index) => (
                  <span key={index} className="badge bg-primary py-2 px-3" style={{ borderRadius: '20px' }}>{sport}</span>
                ))}
              </div>
            </div>

            <div className="mt-auto d-flex justify-content-between gap-2">
              <button className="btn btn-outline-primary btn-sm flex-grow-1"
                style={{ minWidth: '100px' }}
                onClick={handleViewDetails}>
                Ver Canchas
              </button>
              <button className="btn btn-outline-warning btn-sm px-3" onClick={handleEditClick}>
                <i className="bi bi-pencil"></i> Editar
              </button>
              <button className="btn btn-outline-danger btn-sm px-3" onClick={handleDeleteClick}>
                <i className="bi bi-trash"></i> Eliminar
              </button>
            </div>
          </div>
          <div className="card-footer text-muted text-center py-2" style={{ fontSize: '0.85rem' }}>
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
          ¿Estás seguro que deseas eliminar el club "{club.nombre}"? Esta acción no se puede deshacer.
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
