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
  const handleBack = () => navigate('/');

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light py-2">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="#">CanchaGo</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#" onClick={handleBack}>Home</a>
            </li>
          </ul>
          
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
                  className="btn btn-primary dropdown-toggle d-flex align-items-center py-1 px-3" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ fontSize: '0.9rem' }}
                >
                  <div 
                    className="rounded-circle bg-white text-primary d-flex justify-content-center align-items-center me-2"
                    style={{ 
                      width: "28px", 
                      height: "28px", 
                      fontWeight: "bold", 
                      fontSize: "0.9rem" 
                    }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-sm-inline">{username}</span>
                </button>
                <ul 
                  className="dropdown-menu dropdown-menu-end" 
                  aria-labelledby="userDropdown"
                  style={{ minWidth: '120px' }}
                >
                  <li><button className="dropdown-item small" onClick={handleSettings}>Settings</button></li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li><button className="dropdown-item small" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <button 
                className="btn btn-outline-primary py-1 px-3" 
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