import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAlert } from "../hooks/useAlert.js";

const CrearCanchaModal = ({ show, onClose, onSave, canchaToEdit, club }) => {

  const DEFAULT_IMAGES = {
    Padel: 'https://www.padelprofi.com/wp-content/uploads/2023/04/high-angle-palette-balls-field22-877x1024.jpg', 
    Futbol: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
    Tenis: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg'
  };


  const { error, success } = useAlert();

  const [cancha, setCancha] = useState({
    nombre: '',
    deporte: '',
    dias: [],
    horaInicio: '',
    horaFin: '',
    frecuencia: '60',
    precio: '',
    imagen: '',
    estado: true,
    emailClub: club?.email || ''
  });

  useEffect(() => {
    if (canchaToEdit) {
      // Formatear datos del backend para edición
      const horaInicio = canchaToEdit.horario?.horarioInicio?.split(':').slice(0, 2).join(':') || '00:00';
      const horaFin = canchaToEdit.horario?.horarioFin?.split(':').slice(0, 2).join(':') || '00:00';

      setCancha({
        ...canchaToEdit,
        horaInicio,
        horaFin,
        frecuencia: canchaToEdit.horario?.frecuencia?.replace('min', '') || '60',
        dias: canchaToEdit.horario?.diasDisponibles?.split(',') || [],
        emailClub: canchaToEdit.emailClub || club?.email || '' // Prioridad: canchaToEdit > club > ''
      });
    } else {
      // Inicialización para nueva cancha
      setCancha({
        nombre: '',
        deporte: club?.deportes?.[0] || '', // Primer deporte del club como valor por defecto
        dias: [],
        horaInicio: '00:00',
        horaFin: '00:00',
        frecuencia: '60',
        precio: '',
        imagen: '',
        estado: true,
        emailClub: club?.email || ''
      });
    }

    console.log('Datos del club:', club); // Para debug
  }, [canchaToEdit, show, club]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'dias') {
      setCancha((prev) => {
        const dias = prev.dias.includes(value)
          ? prev.dias.filter((dia) => dia !== value)
          : [...prev.dias, value];
        return { ...prev, dias: dias };
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

    const canchaToSave = {
      ...cancha,
      dias: cancha.dias.join(',')
    };

    const finalData = {
      ...canchaToSave,
      imagen: cancha.imagen.trim() || DEFAULT_IMAGES[cancha.deporte] || '',
      frecuencia: canchaToSave.frecuencia === '60' ? "1h" : "30min",
    };
    

    if (cancha.dias.length === 0) {
      error('Debes seleccionar al menos un día disponible para la cancha.');
      return;
    }


    onSave(finalData);
    onClose();
  };



  // Días de la semana en español
  const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  // 0–23 en “HH”
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  // minutos según frecuencia (30 → [00,30], 60 → [00])
  const minutes = cancha.frecuencia === '30' ? ['00', '30'] : ['00'];


  const handleTimePartChange = (field, part, value) => {
    setCancha(prev => {
      // prev[field] es "HH:MM"
      const [h, m] = prev[field]?.split(':') ?? ['00', '00'];
      const newHour = part === 'hour' ? value : h;
      const newMinute = part === 'minute' ? value : m;
      return { ...prev, [field]: `${newHour}:${newMinute}` };
    });
  };

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
              name="imagen"
              value={cancha.imagen}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {cancha.imagen && (
              <div className="mt-2 text-center">
                <img
                  src={cancha.imagen}
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
            <Form.Select name="deporte" value={cancha?.deporte || ''} onChange={handleChange}>
              {club?.deportes.map((deporte, idx) => (
                <option key={`${deporte}-${idx}`} value={deporte}>{deporte}</option>
              ))}
            </Form.Select>

          </Form.Group>

          {/* <Form.Check
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
          /> */}

          <Form.Group className="mb-3">
            <Form.Label>Días disponibles</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {diasSemana.map((dia) => (
                <Form.Check
                  key={dia}
                  type="checkbox"
                  label={dia}
                  value={dia}
                  name="dias"
                  checked={(cancha.dias || []).includes(dia)}
                  onChange={handleChange}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Horario disponible</Form.Label>
            <div className="d-flex gap-4">
              {/* BLOQUE DESDE */}
              <div className="text-center">
                <small className="text-muted d-block mb-1">Desde</small>
                <div className="d-flex gap-1 justify-content-center">
                  <select
                    className="form-select p-1.5 text-sm rounded w-16"
                    value={cancha.horaInicio?.split(':')[0] || '00'}
                    onChange={e => handleTimePartChange('horaInicio', 'hour', e.target.value)}
                  >
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="align-self-center">:</span>
                  <select
                    className="form-select p-1.5 text-sm rounded w-16"
                    value={cancha.horaInicio?.split(':')[1] || '00'}
                    onChange={e => handleTimePartChange('horaInicio', 'minute', e.target.value)}
                  >
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* BLOQUE HASTA */}
              <div className="text-center">
                <small className="text-muted d-block mb-1">Hasta</small>
                <div className="d-flex gap-1 justify-content-center">
                  <select
                    className="form-select p-1.5 text-sm rounded w-16"
                    value={cancha.horaFin?.split(':')[0] || '00'}
                    onChange={e => handleTimePartChange('horaFin', 'hour', e.target.value)}
                  >
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="align-self-center">:</span>
                  <select
                    className="form-select p-1.5 text-sm rounded w-16"
                    value={cancha.horaFin?.split(':')[1] || '00'}
                    onChange={e => handleTimePartChange('horaFin', 'minute', e.target.value)}
                  >
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
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
