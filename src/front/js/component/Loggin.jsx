import React, {useState} from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa';
import { FaUserAlt } from 'react-icons/fa';
const Loggin= () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    });
  
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };
  
    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
      if (!formData.email.trim()) {
        newErrors.email = 'Email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email no es válido';
      }
      if (!formData.password) {
        newErrors.password = 'Contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Debe tener al menos 8 caracteres';
      } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = 'Debe contener una mayúscula y un número';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
      if (!formData.terms) newErrors.terms = 'Debes aceptar los términos';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        console.log('Formulario enviado:', formData);
        // Aquí iría la lógica para enviar los datos al servidor
        alert('Registro exitoso!');
      }
    };
  
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    return (
      <div className="container py-5">
        <div className="registration-container mx-auto">
          <div className="registration-header">
            <h2>< FaUserAlt className="me-2" /> Crear Cuenta</h2>
            <p className="mb-0">Únete a nuestra comunidad</p>
          </div>
          
          <div className="registration-body">
            <form onSubmit={handleSubmit}>
              {/* Campos de nombre */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="firstName" className="form-label">Nombre</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaUser /></span>
                    <input 
                      type="text" 
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} 
                      id="firstName" 
                      name="firstName"
                      placeholder="Juan" 
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label">Apellido</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaUser /></span>
                    <input 
                      type="text" 
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} 
                      id="lastName" 
                      name="lastName"
                      placeholder="Mago" 
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
                </div>
              </div>
              
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input 
                    type="email" 
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                    id="email" 
                    name="email"
                    placeholder="juan@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>
              
              {/* Contraseña */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                    id="password" 
                    name="password"
                    placeholder="Mínimo 8 caracteres" 
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button" 
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password ? (
                  <div className="invalid-feedback d-block">{errors.password}</div>
                ) : (
                  <div className="form-text">Debe contener al menos 8 caracteres, una mayúscula y un número.</div>
                )}
              </div>
              
              {/* Confirmar contraseña */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} 
                    id="confirmPassword" 
                    name="confirmPassword"
                    placeholder="Repite tu contraseña" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
              </div>
              
              {/* Términos y condiciones */}
              <div className="mb-4 form-check">
                <input 
                  type="checkbox" 
                  className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`} 
                  id="terms" 
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="terms">
                  Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a>
                </label>
                {errors.terms && <div className="invalid-feedback d-block">{errors.terms}</div>}
              </div>
              
              {/* Botón de registro */}
              <div className="d-grid mb-4">
                <button type="submit" className="btn btn-register btn-primary text-white">
                  Registrarse
                </button>
              </div>
              
              {/* Divisor */}
              <div className="divider">O regístrate con</div>
              
              {/* Botones sociales */}
              <div className="text-center">
                <button type="button" className="social-btn">
                  <FaGoogle className="text-danger me-2" /> Google
                </button>
                <button type="button" className="social-btn">
                  <FaFacebookF className="text-primary me-2" /> Facebook
                </button>
                <button type="button" className="social-btn">
                  <FaApple className="me-2" /> Apple
                </button>
              </div>
            </form>
          </div>
          
          <div className="text-center py-3 bg-light">
            ¿Ya tienes una cuenta? <a href="#" className="text-primary">Inicia sesión</a>
          </div>
        </div>
      </div>
    );
  };

export default Loggin