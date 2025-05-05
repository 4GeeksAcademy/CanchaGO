import React, { useEffect, useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        if (store.clubsDeportista.length) {
            const found = store.clubsDeportista.find(c => c.email === email.trim());
            setClub(found || null);
        }
    }, [store.clubsDeportista, email]);

    return (
        <>
            <Navbar />
            <div className="view-club-page">
                <div className="view-club-container container mt-4">
                    <div className="view-club-header">
                        <button
                            className="btn btn-danger back-btn"
                            onClick={() => navigate(-1)}
                        >
                            <i className="fa-solid fa-arrow-left"></i> Volver
                        </button>
                        <h2 className="club-title">{club?.nombre || 'Cargando...'}</h2>
                        <p className="club-address">{club?.direccion}</p>
                        <span className="sport-pill">{selectedSport}</span>
                    </div>

                    <div className="row cancha-grid">
                        {club?.canchas
                            .filter(c => c.deporte === selectedSport)
                            .map(cancha => (
                                <div key={cancha.idCancha} className="col">
                                    <ViewCanchaCard cancha={cancha} />
                                </div>
                            ))}

                        {club && !club.canchas.some(c => c.deporte === selectedSport) && (
                            <p className="no-canchas">
                                No hay canchas disponibles para {selectedSport}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewClubCanchas;