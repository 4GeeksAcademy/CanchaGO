// src/front/js/component/CrearClubModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAlert } from '../hooks/useAlert.js';

// Iconos Leaflet por defecto
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Al hacer clic, actualiza posición
function LocationMarker({ onClick }) {
    useMapEvents({
        click(e) {
            onClick([e.latlng.lat, e.latlng.lng]);
        }
    });
    return null;
}

// Recentrar cuando cambie `position`
function Recenter({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);
    return null;
}

const DEFAULT_COORDS = [10.480863, -66.860943]; // Caracas
const SPORTS = ['Futbol', 'Tenis', 'Padel'];
const DEFAULT_IMAGE_URL =
    'https://aerialarchives.photoshelter.com/img-get2/I0000zQm.AS6xl0E/fit=1000x750/Stanford-University-sports-complex-aerial-photograph-AHLB6085.jpg';

export default function CrearClubModal({ show, onClose, onSave, clubToEdit }) {
    const { error } = useAlert();
    const [loading, setLoading] = useState(false);
    const [clubData, setClubData] = useState({
        nombre: '',
        descripcion: '',
        direccion: '',
        googleMapsLink: '',
        email: '',
        telefono: '',
        imagen: '',
        deportes: []
    });
    const [markerPos, setMarkerPos] = useState(DEFAULT_COORDS);

    useEffect(() => {
        if (clubToEdit) {
            // Cargo datos
            setClubData({
                nombre: clubToEdit.nombre || '',
                descripcion: clubToEdit.descripcion || '',
                direccion: clubToEdit.direccion || '',
                googleMapsLink: clubToEdit.googleMapsLink || '',
                email: clubToEdit.email || '',
                telefono: clubToEdit.telefono || '',
                imagen: clubToEdit.imagen || '',
                deportes: clubToEdit.deportes || []
            });
            // Extraigo coords de la URL
            try {
                const url = new URL(clubToEdit.googleMapsLink);
                const q = url.searchParams.get('query');
                if (q) {
                    const [lat, lng] = q.split(',').map(Number);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        setMarkerPos([lat, lng]);
                    }
                }
            } catch {
                setMarkerPos(DEFAULT_COORDS);
            }
        } else {
            // Nuevo club: limpio datos y centro en Caracas
            setClubData({
                nombre: '',
                descripcion: '',
                direccion: '',
                googleMapsLink: '',
                email: '',
                telefono: '',
                imagen: '',
                deportes: []
            });
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
            error('Nombre, Email y Teléfono son obligatorios');
            return false;
        }
        if (!clubData.deportes.length) {
            error('Selecciona al menos un deporte');
            return false;
        }
        if (!clubData.googleMapsLink) {
            error('Selecciona la ubicación en el mapa');
            return false;
        }
        return true;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        await onSave({
            ...clubData,
            imagen: clubData.imagen.trim() || DEFAULT_IMAGE_URL
        });
        setLoading(false);
        onClose();
    };

    if (!show) return null;

    return (
        <Modal show onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {clubToEdit ? 'Editar Club' : 'Crear Nuevo Club'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        {/* Nombre y Teléfono */}
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

                        {/* Email e Imagen */}
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
                            <Form.Label>Imagen (URL)</Form.Label>
                            <Form.Control
                                name="imagen"
                                value={clubData.imagen}
                                onChange={handleChange}
                                placeholder="Opcional"
                            />
                        </div>

                        {/* Descripción y Dirección */}
                        <div className="col-12">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                // as="textarea" rows={2}
                                name="descripcion"
                                value={clubData.descripcion}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-12">
                            <Form.Label>Dirección Física</Form.Label>
                            <Form.Control
                                name="direccion"
                                value={clubData.direccion}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Deportes */}
                        <div className="col-12">
                            <Form.Label>Deportes *</Form.Label>
                            <div className="d-flex gap-2 flex-wrap">
                                {SPORTS.map(s => (
                                    <Form.Check
                                        inline
                                        key={s}
                                        type="checkbox"
                                        label={s}
                                        checked={clubData.deportes.includes(s)}
                                        onChange={() => toggleSport(s)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mapa */}
                        <div className="col-12">
                            <Form.Label>Ubicación *</Form.Label>
                            <div style={{ height: 300, borderRadius: 8, overflow: 'hidden' }}>
                                <MapContainer
                                    center={markerPos}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    whenCreated={map => map.invalidateSize()}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Recenter position={markerPos} />
                                    <LocationMarker onClick={handleMapClick} />
                                    {markerPos && <Marker position={markerPos} />}
                                </MapContainer>
                            </div>
                            <Form.Text className="text-muted">
                                Haz clic en el mapa para colocar el marcador.
                            </Form.Text>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center mt-4">
                        <Button variant="secondary" onClick={onClose} className="me-2">
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading
                                ? <Spinner animation="border" size="sm" />
                                : clubToEdit ? 'Guardar Cambios' : 'Crear Club'
                            }
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
