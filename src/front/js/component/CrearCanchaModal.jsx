import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useAlert } from "../hooks/useAlert.js";
import axios from 'axios';
import '../../styles/CrearCanchaModal.css';

const CrearCanchaModal = ({ show, onClose, onSave, canchaToEdit, club }) => {
  const DEFAULT_IMAGES = {
    Padel: 'https://www.padelprofi.com/wp-content/uploads/2023/04/high-angle-palette-balls-field22-877x1024.jpg',
    Futbol: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
    Tenis: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg'
  };

  const { error } = useAlert();

  const [cancha, setCancha] = useState({
    nombre: '',
    deporte: '',
    dias: [],
    horaInicio: '00:00',
    horaFin: '00:00',
    frecuencia: '60',
    precio: '',
    imagen: '',
    estado: true,
    emailClub: club?.email || ''
  });

  // Cloudinary image upload
  const fileInputRef = useRef();
  const [localImageFile, setLocalImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (canchaToEdit) {
      const hi = canchaToEdit.horario?.horarioInicio?.slice(0, 5) || '00:00';
      const hf = canchaToEdit.horario?.horarioFin?.slice(0, 5) || '00:00';
      setCancha({
        nombre: canchaToEdit.nombre,
        deporte: canchaToEdit.deporte,
        dias: canchaToEdit.horario?.diasDisponibles?.split(',') || [],
        horaInicio: hi,
        horaFin: hf,
        frecuencia: canchaToEdit.horario?.frecuencia === '30m' ? '30' : '60',
        precio: canchaToEdit.precio,
        imagen: canchaToEdit.imagen || '',
        estado: canchaToEdit.estado,
        emailClub: canchaToEdit.emailClub || club?.email || ''
      });
      setPreviewUrl(canchaToEdit.imagen || '');
    } else {
      setCancha(cd => ({
        ...cd,
        deporte: club?.deportes?.[0] || ''
      }));
      setPreviewUrl('');
      setLocalImageFile(null);
    }
  }, [canchaToEdit, show, club]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === 'dias') {
      setCancha(prev => {
        const dias = prev.dias.includes(value)
          ? prev.dias.filter(d => d !== value)
          : [...prev.dias, value];
        return { ...prev, dias };
      });
    } else {
      setCancha(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validate = () => {
    if (!cancha.nombre) {
      error('El nombre es obligatorio'); return false;
    }
    if (cancha.dias.length === 0) {
      error('Selecciona al menos un día disponible'); return false;
    }
    return true;
  };

  const uploadToCloudinary = async file => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      form
    );
    setUploading(false);
    return res.data.secure_url;
  };

  const removeImage = () => {
    setCancha(c => ({ ...c, imagen: '' }));
    setPreviewUrl('');
    setLocalImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    let imageUrl = previewUrl || DEFAULT_IMAGES[cancha.deporte] || '';
    if (localImageFile) {
      try {
        imageUrl = await uploadToCloudinary(localImageFile);
      } catch {
        error('Error subiendo la imagen');
        return;
      }
    }

    const final = {
      ...cancha,
      dias: cancha.dias.join(','),
      frecuencia: cancha.frecuencia === '60' ? '1h' : '30min',
      imagen: imageUrl
    };

    onSave(final);
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
      <Modal.Header className="position-relative">
        <Modal.Title style={{ color: 'white', fontSize: '1.5rem' }}>
          {canchaToEdit ? 'Editar Cancha' : 'Crear Nueva Cancha'}
        </Modal.Title>
        <button type="button" className="modal-close-btn" onClick={onClose} style={{ fontSize: '2.5rem', color: '#333' }}>
          &times;
        </button>
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
              name="deporte"
              value={cancha.deporte}
              onChange={handleChange}
              disabled={!!canchaToEdit}
            >
              {club?.deportes.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Días disponibles</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {diasSemana.map(d => (
                <Form.Check
                  key={d}
                  label={d}
                  name="dias"
                  type="checkbox"
                  value={d}
                  checked={cancha.dias.includes(d)}
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
            <Form.Label>Frecuencia (min)</Form.Label>
            <Form.Select
              name="frecuencia"
              value={cancha.frecuencia}
              onChange={handleChange}
              disabled={!!canchaToEdit}
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

          {/* Cloudinary uploader */}
          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <div className="image-uploader">
              <button
                type="button"
                className="image-uploader__btn"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
              >
                {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="image-uploader__input"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) {
                    setLocalImageFile(f);
                    setPreviewUrl(URL.createObjectURL(f));
                  }
                }}
              />
            </div>
          </Form.Group>

          {previewUrl && (
            <div className="cancha-image-preview mb-3">
              <button
                type="button"
                className="image-remove-btn"
                onClick={removeImage}
              >×</button>
              <img src={previewUrl} alt="Preview Cancha" />
            </div>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={onClose} className="me-2">
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
