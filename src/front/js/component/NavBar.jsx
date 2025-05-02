import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState('All');
  const { store, actions } = useContext(Context);

  const username = store.username;
  const userRole = store.role;

  const handleLogin = () => navigate('/signup');
  const handleLogout = () => { actions.logoutUser(); navigate('/'); };
  const handleSettings = () => navigate('/settings');
  const handleFieldSelect = (field) => setSelectedField(field);
  const goHome = () => {
    navigate('/');
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2">
      <div className="container-fluid">
        <button className="btn btn-link navbar-brand fs-3 fw-bold text-white" onClick={goHome}>
          CanchaGo
        </button>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>

          <div className="d-flex align-items-center gap-3">
            <div className="me-2" style={{ minWidth: '160px' }}>
              <select
                className="form-select form-select-sm"
                value={selectedField}
                onChange={(e) => handleFieldSelect(e.target.value)}
              >
                <option value="All">Elige Cancha</option>
                <option value="Futbol">Cancha de Futbol</option>
                <option value="Tennis">Cancha de Tennis</option>
                <option value="Padel">Cancha de Padel</option>
                <option value="Basketball">Cancha de Basketball</option>
              </select>
            </div>

            {username && userRole === "Deportista" ? (
              <div className="dropdown ms-2">
                <button
                  className="btn dropdown-toggle d-flex align-items-center px-3 py-2"
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
                    <button className="dropdown-item" onClick={handleSettings}>
                      <i className="fas fa-cog me-2"></i>Settings
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                className="btn btn-outline-light py-1 px-3"
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