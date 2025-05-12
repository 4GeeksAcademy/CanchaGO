// ViewClubCanchas.jsx
import React, { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import ViewCanchaCard from './ViewCanchaCard.jsx';
import Navbar from './NavBar.jsx';
import { Context } from '../store/appContext.js';
import '../../styles/ViewClubCanchas.css';

const ViewClubCanchas = () => {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const { paddelEmail } = useParams();
    const [email] = useState(paddelEmail.split('-')[0]);
    const [selectedSport] = useState(paddelEmail.split('-')[1]);
    const [club, setClub] = useState(null);

    useEffect(() => {

        window.scrollTo(0, 0);
        if (store.clubsDeportista.length) {
            const found = store.clubsDeportista.find(c => c.email === email.trim());
            setClub(found || null);
        }
    }, [store.clubsDeportista, email]);

    return (
        <>
            <Navbar />
            <div className="view-club-page">
                <div className="view-club-container">
                    <div className="view-club-header">
                        <button
                            className="back-btn"
                            onClick={() => navigate(-1)}
                        >
                            <FiArrowLeft className="back-icon" />
                            Volver
                        </button>

                        <div className="header-content1">
                            <h1 className="club-title">{club?.nombre || 'Cargando...'}</h1>
                            <div className="club-info">

                                <span className="club-address">📍 {club?.direccion} </span>



                                <span className="sport-pill">{selectedSport}</span>
                            </div>
                        </div>
                    </div>

                    <div className="cancha-grid-container">
                        {club?.canchas?.filter(c => c.deporte === selectedSport).length > 0 ? (
                            <div className="cancha-grid">
                                {club.canchas
                                    .filter(c => c.deporte === selectedSport)
                                    .map((cancha, index) => (
                                        <ViewCanchaCard
                                            key={cancha.idCancha}
                                            cancha={cancha}
                                            index={index}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <div className="no-canchas">
                                <div className="empty-state">
                                    <div className="empty-icon">⛔</div>
                                    <h3>No hay canchas disponibles</h3>
                                    <p>Prueba con otro deporte o club</p>
                                    {/* <button
                                        className="back-btn"
                                        onClick={() => navigate(-1)}
                                    >
                                        <FiArrowLeft />
                                        Volver
                                    </button> */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewClubCanchas;