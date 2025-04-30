import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CrearCanchaModal = ({ show, onClose }) => {
  const [cancha, setCancha] = useState({
    nombre: '',
    tipo: 'Fútbol 5',
    iluminacion: false,
    techada: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCancha((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nueva cancha:', cancha); // replace with actual save logic
    onClose(); // close modal after save
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Cancha</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la cancha</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={cancha.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de cancha</Form.Label>
            <Form.Select
              name="tipo"
              value={cancha.tipo}
              onChange={handleChange}
            >
              <option value="Fútbol 5">Fútbol 5</option>
              <option value="Fútbol 7">Fútbol 7</option>
              <option value="Fútbol 11">Fútbol 11</option>
              <option value="Pádel">Pádel</option>
              <option value="Tenis">Tenis</option>
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Iluminación"
            name="iluminacion"
            checked={cancha.iluminacion}
            onChange={handleChange}
            className="mb-2"
          />

          <Form.Check
            type="checkbox"
            label="Techada"
            name="techada"
            checked={cancha.techada}
            onChange={handleChange}
            className="mb-3"
          />

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onClose} className="me-2">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cancha
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CrearCanchaModal;
