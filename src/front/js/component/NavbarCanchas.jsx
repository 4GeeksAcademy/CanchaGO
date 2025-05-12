import React, { useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";

const NavbarCanchas = ({ onOpenCrearCancha }) => {
  const { store, actions } = useContext(Context);
  const { username } = store;
  const navigate = useNavigate();

  const handleLogout = () => {
    actions.logoutUser();
    navigate('/');
  };
  const handleSettings = () => navigate('/Configuraciones');
  const goHome = () => navigate('/');
  const goToDashboard = () => navigate('/Propietario');
  const handleReservas = () => navigate('/Reservas');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success py-3 shadow">
      <div className="container-fluid px-4">
        <div className="logoContainer" onClick={goHome}>
          <img src={canchaLogoSinFondo} alt="CanchaGO" />
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="d-flex align-items-center ms-auto gap-3 navbar-buttons-container">
            <button className="btn btn-outline-light btn-lg mx-2" onClick={goToDashboard}>
              <i className="fas fa-chart-line me-2"></i>Volver
            </button>

            <button
              className="btn btn-light btn-lg mx-2"
              onClick={onOpenCrearCancha}
            >
              <i className="fas fa-plus me-2"></i>Nueva Cancha
            </button>

            {username && (
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
                  <li>
                    <button className="dropdown-item" onClick={handleSettings}>
                      <i className="fas fa-cog me-2"></i> Configuraciones
                    </button>
                  </li>

                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i> Logout
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

export default NavbarCanchas;