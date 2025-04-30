import React, { useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';


const Navbarpropietario = ({ onOpenCrearClub}) => {
  const { store, actions } = useContext(Context);
  const { token, role, username } = store;
  const navigate = useNavigate();
  const handleLogout = () => {
    actions.logoutUser();
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const goHome = () => {
    navigate('/');
  };

  const handleIniciarComoDeportista = () => {
    navigate('/home');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3 shadow">
      <div className="container-fluid px-4">
      <button className="btn btn-link navbar-brand fs-3 fw-bold text-white" onClick={goHome}>
          CanchaGo
        </button>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {!role == "Deportita" && (
              <button className="btn btn-outline-light btn-lg" onClick={handleIniciarComoDeportista}>
                Iniciar como Deportista
              </button>
            )}

            <button className="btn btn-outline-light btn-lg" onClick={onOpenCrearClub}>
              Crear Club
            </button>


            {username && (
              <div className="dropdown">
                <button
                  className="btn btn-light dropdown-toggle d-flex align-items-center px-3 py-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2"
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbarpropietario;
