import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhoneAlt } from 'react-icons/fa';
import { useAlert } from "../hooks/useAlert";
import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";
import "../../styles/loggin.css";

const Loggin = () => {
  const navigate = useNavigate();
  const { error, success } = useAlert();
  const { actions } = useContext(Context);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    clave: '',
    nombreUsuario: '',
    telefono: '',
    rol: 'Deportista'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre completo es requerido';
    if (!formData.email.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)) newErrors.email = 'Email inválido';
    if (formData.clave.length < 8) newErrors.clave = 'La clave debe tener al menos 8 caracteres';
    if (!formData.nombreUsuario) newErrors.nombreUsuario = 'Nombre de usuario requerido';
    if (!formData.telefono.match(/^\d{10,15}$/)) newErrors.telefono = 'Teléfono inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const response = await actions.createUser(formData);
    if (response.success) {
      success("¡Registro exitoso!");
      navigate("/login");
    } else {
      error(response.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-logo-container">
            <img src={canchaLogoSinFondo} alt="CanchaGO" className="auth-logo" />
          </div>

          {/* Nombre completo */}
          <div className="input-group">
            <span className="input-icon"><FaUser /></span>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              className={`auth-input ${errors.nombre ? 'input-error' : ''}`}
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          {/* Email */}
          <div className="input-group">
            <span className="input-icon"><FaEnvelope /></span>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className={`auth-input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Nombre de usuario */}
          <div className="input-group">
            <span className="input-icon"><FaUser /></span>
            <input
              type="text"
              name="nombreUsuario"
              placeholder="Nombre de usuario"
              className={`auth-input ${errors.nombreUsuario ? 'input-error' : ''}`}
              value={formData.nombreUsuario}
              onChange={handleChange}
            />
            {errors.nombreUsuario && <span className="error-message">{errors.nombreUsuario}</span>}
          </div>

          {/* Teléfono */}
          <div className="input-group">
            <span className="input-icon"><FaPhoneAlt /></span>
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              className={`auth-input ${errors.telefono ? 'input-error' : ''}`}
              value={formData.telefono}
              onChange={handleChange}
            />
            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
          </div>

          {/* Clave */}
          <div className="input-group">
            <span className="input-icon"><FaLock /></span>
            <input
              type={showPassword ? "text" : "password"}
              name="clave"
              placeholder="Contraseña"
              className={`auth-input ${errors.clave ? 'input-error' : ''}`}
              value={formData.clave}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Mostrar contraseña"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.clave && <span className="error-message">{errors.clave}</span>}
          </div>

          {/* Rol */}
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="auth-select"
          >
            <option value="Deportista">Deportista</option>
            <option value="Propietario">Propietario</option>
          </select>

          <button type="submit" className="btn-primary">Registrarse</button>
        </form>

        <div className="auth-links">
          <button onClick={() => navigate("/login")} className="auth-link">
            ¿Ya tienes cuenta? Inicia sesión
          </button>
          <button onClick={() => navigate("/")} className="auth-link">
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Loggin;