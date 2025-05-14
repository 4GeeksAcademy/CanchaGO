import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAlert } from '../hooks/useAlert.js';
import '../../styles/CrearClubModal.css';

// Leaflet icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Marker on click
function LocationMarker({ onClick }) {
    useMapEvents({
        click(e) { onClick([e.latlng.lat, e.latlng.lng]); }
    });
    return null;
}

// Recenter map
function Recenter({ position }) {
    const map = useMap();
    useEffect(() => { if (position) map.setView(position, map.getZoom()); }, [position, map]);
    return null;
}

const DEFAULT_COORDS = [10.480863, -66.860943];
const SPORTS = ['Futbol', 'Tenis', 'Padel'];
const DEFAULT_IMAGE_URL = 'https://aerialarchives.photoshelter.com/...jpg';

export default function CrearClubModal({ show, onClose, onSave, clubToEdit }) {
    const { error } = useAlert();
    const [loading, setLoading] = useState(false);
    const [clubData, setClubData] = useState({
        nombre: '', descripcion: '', direccion: '',
        googleMapsLink: '', email: '', telefono: '',
        deportes: []
    });
    const [markerPos, setMarkerPos] = useState(DEFAULT_COORDS);

    // Imagen
    const fileInputRef = useRef();
    const [localImageFile, setLocalImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (clubToEdit) {
            setClubData({
                nombre: clubToEdit.nombre || '',
                descripcion: clubToEdit.descripcion || '',
                direccion: clubToEdit.direccion || '',
                googleMapsLink: clubToEdit.googleMapsLink || '',
                email: clubToEdit.email || '',
                telefono: clubToEdit.telefono || '',
                deportes: clubToEdit.deportes || []
            });
            setPreviewUrl(clubToEdit.imagen || '');
            try {
                const url = new URL(clubToEdit.googleMapsLink);
                const q = url.searchParams.get('query');
                if (q) {
                    const [lat, lng] = q.split(',').map(Number);
                    if (!isNaN(lat) && !isNaN(lng)) setMarkerPos([lat, lng]);
                }
            } catch {
                setMarkerPos(DEFAULT_COORDS);
            }
        } else {
            setClubData({
                nombre: '', descripcion: '', direccion: '',
                googleMapsLink: '', email: '', telefono: '',
                deportes: []
            });
            setPreviewUrl('');
            setMarkerPos(DEFAULT_COORDS);
        }
    }, [clubToEdit, show]);

    const handleChange = e => {
        const { name, value } = e.target;
        setClubData(cd => ({ ...cd, [name]: value }));
    };
    const toggleSport = s => {
        setClubData(cd => {
            const deportes = cd.deportes.includes(s)
                ? cd.deportes.filter(x => x !== s)
                : [...cd.deportes, s];
            return { ...cd, deportes };
        });
    };
    const handleMapClick = ([lat, lng]) => {
        setMarkerPos([lat, lng]);
        setClubData(cd => ({
            ...cd,
            googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        }));
    };
    const validate = () => {
        if (!clubData.nombre || !clubData.email || !clubData.telefono) {
            error('Nombre, Email y Teléfono son obligatorios'); return false;
        }
        if (!clubData.deportes.length) {
            error('Selecciona al menos un deporte'); return false;
        }
        if (!clubData.googleMapsLink) {
            error('Selecciona la ubicación en el mapa'); return false;
        }
        return true;
    };

    const uploadImageToCloudinary = async file => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );
        setUploading(false);
        return res.data.secure_url;
    };

    const removeImage = () => {
        setLocalImageFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        let imageUrl = (previewUrl !== '' ? previewUrl : DEFAULT_IMAGE_URL);
        if (localImageFile) {
            try {
                imageUrl = await uploadImageToCloudinary(localImageFile);
            } catch {
                error('Falló la subida de imagen');
                setLoading(false);
                return;
            }
        }

        await onSave({ ...clubData, imagen: imageUrl });
        setLoading(false);
        onClose();
    };

    if (!show) return null;

    return (
        <Modal show onHide={onClose} size="lg" centered>
            <Modal.Header className="position-relative modal-header">
                <Modal.Title style={{ color: 'white', fontSize: '1.5rem' }}>
                    {clubToEdit ? 'Editar Club' : 'Crear Nuevo Club'}
                </Modal.Title>
                {/* Botón de cierre custom */}
                <button type="button" className="modal-close-btn" onClick={onClose} style={{ fontSize: '2.5rem', color: '#333' }}>

                    &times;
                </button>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                name="nombre"
                                value={clubData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <Form.Label>Teléfono *</Form.Label>
                            <Form.Control
                                name="telefono"
                                value={clubData.telefono}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={clubData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <Form.Label>Imagen *</Form.Label>
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
                        </div>
                        <div className="col-md-12">
                            {previewUrl && (
                                <div className="image-preview">
                                    <button
                                        type="button"
                                        className="image-preview__remove"
                                        onClick={removeImage}
                                    >×</button>
                                    <img src={previewUrl} alt="Preview" />
                                </div>
                            )}
                        </div>
                        <div className="col-12">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                name="descripcion"
                                value={clubData.descripcion}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-12">
                            <Form.Label>Dirección Física</Form.Label>
                            <Form.Control
                                name="direccion"
                                value={clubData.direccion}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-12">
                            <Form.Label>Deportes *</Form.Label>
                            <div className="d-flex gap-2 flex-wrap">
                                {SPORTS.map(s => (
                                    <Form.Check inline key={s}
                                        type="checkbox" label={s}
                                        checked={clubData.deportes.includes(s)}
                                        onChange={() => toggleSport(s)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="col-12">
                            <Form.Label>Ubicación *</Form.Label>
                            <div className="map-selector">
                                <MapContainer
                                    center={markerPos}
                                    zoom={13}
                                    style={{ width: '100%', height: '400px' }}
                                    whenCreated={map => map.invalidateSize()}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Recenter position={markerPos} />
                                    <LocationMarker onClick={handleMapClick} />
                                    <Marker position={markerPos} />
                                </MapContainer>
                            </div>
                            <Form.Text className="text-muted">
                                Haz clic en el mapa para colocar el marcador.
                            </Form.Text>
                        </div>
                    </div>

                    <div className="modal-footer d-flex justify-content-end">
                        <Button variant="secondary" onClick={onClose} className="me-2">
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading || uploading}>
                            {loading ? <Spinner animation="border" size="sm" /> :
                                clubToEdit ? 'Guardar Cambios' : 'Crear Club'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
