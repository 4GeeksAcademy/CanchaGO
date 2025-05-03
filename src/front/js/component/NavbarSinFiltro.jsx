import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';

const NavbarSinFiltro = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);

    const username = store.username;
    const userRole = store.role;

    const handleLogin = () => navigate('/signup');
    const handleLogout = () => { actions.logoutUser(); navigate('/'); };
    const handleReservas = () => navigate('/MisReservas');
    const goHome = () => navigate('/');

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2">
            <div className="container-fluid">
                <button className="btn btn-link navbar-brand fs-3 fw-bold text-white" onClick={goHome}>
                    CanchaGo
                </button>

                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    {/* Empty nav items to push login/signup to the right */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
                    
                    <div className="d-flex align-items-center gap-3">
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
                                            <i className="fas fa-sign-out-alt me-2"></i> Logout
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

export default NavbarSinFiltro;