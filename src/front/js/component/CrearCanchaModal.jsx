import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CrearCanchaModal = ({ show, onClose, onSave, canchaToEdit }) => {
  const [cancha, setCancha] = useState({
    nombre: '',
    tipo: 'Fútbol 5',
    iluminacion: false,
    techada: false,
    diasDisponibles: [],
    horaInicio: '',
    horaFin: '',
    frecuencia: '60',
    precio: '',
    imagenUrl: ''
  });

  useEffect(() => {
    if (canchaToEdit) {
      setCancha(canchaToEdit);
    } else {
      setCancha({
        nombre: '',
        tipo: 'Fútbol 5',
        iluminacion: false,
        techada: false,
        diasDisponibles: [],
        horaInicio: '',
        horaFin: '',
        frecuencia: '60',
        precio: '',
        imagenUrl: ''
      });
    }
  }, [canchaToEdit, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'diasDisponibles') {
      setCancha((prev) => {
        const dias = prev.diasDisponibles.includes(value)
          ? prev.diasDisponibles.filter((dia) => dia !== value)
          : [...prev.diasDisponibles, value];
        return { ...prev, diasDisponibles: dias };
      });
    } else {
      setCancha((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(cancha);
    onClose();
  };

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{canchaToEdit ? 'Editar Cancha' : 'Crear Nueva Cancha'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>URL de la imagen</Form.Label>
            <Form.Control
              type="url"
              name="imagenUrl"
              value={cancha.imagenUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {cancha.imagenUrl && (
              <div className="mt-2 text-center">
                <img 
                  src={cancha.imagenUrl} 
                  alt="Vista previa" 
                  className="img-fluid rounded"
                  style={{ maxHeight: '200px' }}
                />
                <small className="text-muted d-block">Vista previa</small>
              </div>
            )}
          </Form.Group>

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
            <Form.Select name="tipo" value={cancha.tipo} onChange={handleChange}>
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

          <Form.Group className="mb-3">
            <Form.Label>Días disponibles</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {diasSemana.map((dia) => (
                <Form.Check
                  key={dia}
                  type="checkbox"
                  label={dia}
                  value={dia}
                  name="diasDisponibles"
                  checked={cancha.diasDisponibles.includes(dia)}
                  onChange={handleChange}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Horario disponible</Form.Label>
            <div className="d-flex gap-3">
              <Form.Control
                type="time"
                name="horaInicio"
                value={cancha.horaInicio}
                onChange={handleChange}
                required
              />
              <Form.Control
                type="time"
                name="horaFin"
                value={cancha.horaFin}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Frecuencia por turno (minutos)</Form.Label>
            <Form.Select
              name="frecuencia"
              value={cancha.frecuencia}
              onChange={handleChange}
              required
            >
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="90">90</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio por turno ($)</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              value={cancha.precio}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="outline-secondary"
              onClick={onClose}
              type="button"
              className="me-2 px-4 py-2 fw-semibold"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="px-4 py-2 fw-semibold"
            >
              Guardar Cancha
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CrearCanchaModal;
