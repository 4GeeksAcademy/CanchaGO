import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Context } from '../store/appContext.js';
import Navbar from './NavBar.jsx';
import { useAlert } from '../hooks/useAlert';
import '../../styles/configuraciones.css';
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaRunning, FaBuilding, FaEye, FaEyeSlash } from 'react-icons/fa';

const ROLES = [
    { name: "Propietario", icon: <FaBuilding /> },
    { name: "Deportista", icon: <FaRunning /> }
];

const Configuraciones = () => {
    const { success, error: showError } = useAlert();
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

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await actions.getCurrentUser();
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    nombre: result.userData.nombre || '',
                    nombreUsuario: result.userData.nombreUsuario || '',
                    email: result.userData.email || '',
                    roles: [...new Set(result.userData.roles)],
                    telefono: result.userData.telefono || '',
                    clave: ''
                }));
            } else {
                showError(result.message);
            }
        } catch (err) {
            showError("Error loading user data");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [actions, showError]);

    useEffect(() => {
        if (!store.token) return;
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = () => {
        setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
    };

    const toggleNewPasswordVisibility = () => {
        setFormData(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.clave && formData.clave.length < 8) {
            showError("Password must be at least 8 characters");
            return;
        }

        const updateData = {
            nombre: formData.nombre.trim(),
            nombreUsuario: formData.nombreUsuario.trim(),
            telefono: formData.telefono.trim()
        };

        if (formData.clave) {
            if (!formData.currentPassword) {
                showError("Debes ingresar tu contraseña actual para cambiarla");
                return;
            }
            updateData.clave = formData.clave;
            updateData.currentPassword = formData.currentPassword;
        }

        try {
            const result = await actions.updateUserSettings(updateData);
            if (result.success) {
                success("Changes saved successfully");
                setFormData(prev => ({
                    ...prev,
                    clave: '',
                    nombre: result.userData.nombre || prev.nombre,
                    nombreUsuario: result.userData.nombreUsuario || prev.nombreUsuario,
                    telefono: result.userData.telefono || prev.telefono
                }));
            } else {
                showError(result.message);
            }
        } catch (err) {
            showError("Error saving changes");
            console.error("Save error:", err);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3">Loading user data...</span>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <Container className="config-container py-5">
                <h2 className="text-center mb-4">Settings</h2>

                <Card className="p-4 shadow border-0 rounded-4 bg-light">
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group controlId="formNombre">
                                    <Form.Label>Nombre</Form.Label>
                                    <div className="input-group">
                                        <span className="input-icon"><FaUser /></span>
                                        <Form.Control
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
                                            className="auth-input"
                                            required
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formNombreUsuario">
                                    <Form.Label>Nombre de usuario</Form.Label>
                                    <div className="input-group">
                                        <span className="input-icon"><FaUser /></span>
                                        <Form.Control
                                            type="text"
                                            name="nombreUsuario"
                                            value={formData.nombreUsuario}
                                            onChange={handleChange}
                                            placeholder="Nombre de usuario"
                                            className="auth-input"
                                            required
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <div className="input-group">
                                        <span className="input-icon"><FaEnvelope /></span>
                                        <Form.Control
                                            type="email"
                                            value={formData.email}
                                            readOnly
                                            className="auth-input bg-secondary-subtle"
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formRoles">
                                    <Form.Label>Roles</Form.Label>
                                    <div className="role-selection-container">
                                        <div className="role-badges-container">
                                            {formData.roles.map(role => {
                                                const roleObj = ROLES.find(r => r.name === role);
                                                return (
                                                    <span key={role} className="role-badge">
                                                        {roleObj?.icon} <span className="ms-2">{role}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group controlId="formTelefono">
                                    <Form.Label>Teléfono</Form.Label>
                                    <div className="input-group">
                                        <span className="input-icon"><FaPhoneAlt /></span>
                                        <Form.Control
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="Teléfono"
                                            className="auth-input"
                                        />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formCurrentPassword">
                                    <Form.Label>Contraseña Actual</Form.Label>
                                    <div className="input-group">
                                        <span className="input-icon"><FaLock /></span>
                                        <Form.Control
                                            type={formData.showPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Escribe tu contraseña actual"
                                            className="auth-input"
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={togglePasswordVisibility}
                                            className="password-toggle-btn"
                                        >
                                            {formData.showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </Button>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={12}>
                                <Form.Group controlId="formClave">
                                    <Form.Label>Nueva Contraseña</Form.Label>
                                    <div className="input-group">
                                        <span className="input-icon"><FaLock /></span>
                                        <Form.Control
                                            type={formData.showNewPassword ? "text" : "password"}
                                            name="clave"
                                            value={formData.clave}
                                            onChange={handleChange}
                                            placeholder="Nueva contraseña (mínimo 8 caracteres)"
                                            className="auth-input"
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={toggleNewPasswordVisibility}
                                            className="password-toggle-btn"
                                        >
                                            {formData.showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </Button>
                                    </div>
                                    <Form.Text className="text-muted">
                                        Deja este campo vacío si no quieres cambiar la contraseña
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-center">
                            <Button
                                type="submit"
                                variant="primary"
                                className="mt-4 px-5 py-2 rounded-pill shadow-sm btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span className="ms-2">Guardando...</span>
                                    </>
                                ) : (
                                    "Guardar Cambios"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Container>
        </>
    );
};

export default Configuraciones;