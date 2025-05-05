import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState('All');
  const { store, actions } = useContext(Context);

  const username = store.username;
  const userRole = store.role;

  const handleLogin = () => navigate('/login');
  const handleLogout = () => { actions.logoutUser(); navigate('/'); };
  const handleSettings = () => navigate('/settings');
  const handleReservas = () => navigate('/MisReservas');
  const handleFieldSelect = (field) => setSelectedField(field);
  const goHome = () => navigate('/home');
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2">
      <div className="container-fluid">
        <div className="logoContainer" onClick={goHome}>
          <img src={canchaLogoSinFondo} alt="CanchaGO" />
        </div>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>

          <div className="d-flex align-items-center justify-content-center gap-3 ms-auto">
            {/* <div className="me-2 position-relative" style={{ minWidth: '160px' }}>
              <div className="input-group">
                <select
                  className="form-select rounded-pill border-0 ps-3 pe-5 py-2 shadow-sm"
                  value={selectedField}
                  onChange={(e) => handleFieldSelect(e.target.value)}
                  style={{
                    appearance: 'none',
                    backgroundColor: '#f4f1ee',
                    color: '#495057', // Slightly darker text for contrast
                    cursor: 'pointer',
                    fontWeight: '500',
                    borderRadius: '30px', // Slightly more rounded corners
                    paddingRight: '30px', // Space for custom arrow
                    transition: 'all 0.3s ease',
                  }}
                >
                  <option value="Futbol">Futbol</option>
                  <option value="Tennis">Tenis</option>
                  <option value="Padel">Padel</option>
                </select>
              </div>
            </div> */}

            {username && userRole === "Deportista" ? (
              <div className="dropdown">
                <button
                  className="btn dropdown-toggle d-flex align-items-center px-3 py-2 rounded-pill"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    backgroundColor: "#343a40",
                    border: "1px solid #555",
                    color: "#f8f9fa"
                  }}
                >
                  <div
                    className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2"
                    style={{
                      width: "36px",
                      height: "36px",
                      fontWeight: "bold",
                      fontSize: "1.1rem"
                    }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium">{username}</span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <button className="dropdown-item" onClick={handleReservas}>
                      <i className="fas fa-calendar-alt me-2"></i> Mis Reservas
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                className="btn btn-outline-light py-1 px-3 rounded-pill"
                onClick={handleLogin}
                style={{ fontSize: '0.9rem' }}
              >
                Sign Up / Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;