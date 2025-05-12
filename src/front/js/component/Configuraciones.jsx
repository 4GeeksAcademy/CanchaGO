import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Context } from '../store/appContext.js';
import Navbar from './NavBar.jsx';
import { useAlert } from '../hooks/useAlert';
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaRunning, FaBuilding, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../styles/Configuraciones.css';
import Navbarpropietario from './Navbarpropietario.jsx';

const ROLES = [
    { name: "Propietario", icon: <FaBuilding className="role-icon" /> },
    { name: "Deportista", icon: <FaRunning className="role-icon" /> }
];

const Configuraciones = () => {
    const { success, error } = useAlert();
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        nombreUsuario: '',
        email: '',
        roles: [],
        telefono: '',
        clave: '',
        showPassword: false,
        showNewPassword: false,
        currentPassword: ''
    });

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const result = await actions.getCurrentUser();
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    ...result.userData,
                    roles: [store.role],
                    clave: '',
                    currentPassword: ''
                }));
            }
        } catch (err) {
            error("Error cargando datos del usuario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (store.token) fetchUserData();
    }, [store.token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData = {
                nombre: formData.nombre.trim(),
                email: formData.email.trim(),
                telefono: formData.telefono.trim(),
                ...(formData.clave && { clave: formData.clave })
            };

            const result = await actions.updateUserSettings(updateData);
            if (result.success) {
                success("¡Cambios guardados exitosamente!");
                await fetchUserData();
            }
        } catch (err) {
            error(err.message || "Error al procesar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <>
            {store.role === 'Deportista' ? <Navbar /> : <Navbarpropietario />}
            <div className="background-image"></div>
            <Container className="config-container">
                <h1 className="config-title">Configuración de cuenta</h1>

                <Card className="profile-card">
                    <Form onSubmit={handleSubmit}>
                        {/* Sección Información Principal */}
                        <div className="section-container">
                            <h3 className="section-title">Información personal</h3>
                            <Row className="g-4">
                                <Col xl={6}>
                                    <Form.Group className="input-group">
                                        <FaUser className="input-icon" />
                                        <Form.Control
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Nombre completo"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xl={6}>
                                    <Form.Group className="input-group">
                                        <FaUser className="input-icon" />
                                        <Form.Control
                                            name="nombreUsuario"
                                            value={formData.nombreUsuario}
                                            disabled
                                            placeholder="Nombre de usuario"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xl={6}>
                                    <Form.Group className="input-group">
                                        <FaEnvelope className="input-icon" />
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Correo electrónico"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xl={6}>
                                    <Form.Group className="input-group">
                                        <FaPhoneAlt className="input-icon" />
                                        <Form.Control
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="Teléfono"
                                            maxLength="10"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Sección Roles */}
                        <div className="section-container">
                            <h3 className="section-title">Tipo de cuenta</h3>
                            <div className="roles-container">
                                {ROLES.map((role) => (
                                    <div
                                        key={role.name}
                                        className={`role-card ${formData.roles.includes(role.name) ? 'active' : ''}`}
                                    >
                                        {role.icon}
                                        <span>{role.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sección Seguridad */}
                        <div className="section-container">
                            <h3 className="section-title">Seguridad</h3>
                            <Row className="g-4">
                                <Col xl={6}>
                                    <Form.Group className="input-group">
                                        <FaLock className="input-icon" />
                                        <Form.Control
                                            type={formData.showPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Contraseña actual"
                                        />
                                        <Button
                                            variant="icon"
                                            onClick={() => setFormData(p => ({ ...p, showPassword: !p.showPassword }))}>
                                            {formData.showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </Button>
                                    </Form.Group>
                                </Col>

                                <Col xl={6}>
                                    <Form.Group className="input-group">
                                        <FaLock className="input-icon" />
                                        <Form.Control
                                            type={formData.showNewPassword ? "text" : "password"}
                                            name="clave"
                                            value={formData.clave}
                                            onChange={handleChange}
                                            placeholder="Nueva contraseña"
                                        />
                                        <Button
                                            variant="icon"
                                            onClick={() => setFormData(p => ({ ...p, showNewPassword: !p.showNewPassword }))}>
                                            {formData.showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        <div className="actions-container">
                            <Button
                                type="submit"
                                variant="primary"
                                className="save-button"
                                disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Guardar cambios'}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Container>
        </>
    );
};

export default Configuraciones;