import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState('All');
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserRole = localStorage.getItem('userRole'); 
    setUsername(storedUsername);
    setUserRole(storedUserRole);
  }, []);

  const handleLogin = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    setUserRole(null);
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleFieldSelect = (field) => {
    setSelectedField(field);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">CanchaGo</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item" onClick={handleBack}>
              <a className="nav-link active" aria-current="page" href="#">Home</a>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            {username && userRole === "Deportista" ? (
              <div className="dropdown">
                <button 
                  className="btn btn-primary dropdown-toggle d-flex align-items-center" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <div 
                    className="rounded-circle bg-white text-primary d-flex justify-content-center align-items-center"
                    style={{ width: "40px", height: "40px", marginRight: "8px", fontWeight: "bold", fontSize: "20px" }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                  {username}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><button className="dropdown-item" onClick={handleSettings}>Settings</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <button className="btn btn-outline-primary" onClick={handleLogin}>
                Sign Up / Login
              </button>
            )}
          </div>

          <div className="ms-3">
            <select 
              className="form-select"
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
