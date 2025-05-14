// ViewCanchaCard.jsx
import React, { useState } from 'react';
import { FiInfo, FiCalendar } from 'react-icons/fi';
import { useAlert } from '../hooks/useAlert.js';
import { useContext } from 'react';
import { Context } from '../store/appContext.js';
import { useNavigate } from 'react-router-dom';
import DisponibilidadModal from './DisponibilidadModal.jsx';
import ReservarModal from './ReservarModal.jsx';
import '../../styles/ViewCanchaCard.css';

const formatHora = h => h?.slice(0, 5) || '';
const formatUnit = f => f === '30min' ? '30 min' : 'hora';

const ViewCanchaCard = ({ cancha, index }) => {
    const { store } = useContext(Context);
    const { error } = useAlert();
    const navigate = useNavigate();
    const [showDisp, setShowDisp] = useState(false);
    const [showBook, setShowBook] = useState(false);

    const handleBook = () => {
        if (!store.token || store.role !== 'Deportista') {
            error('Inicia sesión para reservar');
            navigate('/login');
        } else {
            setShowBook(true);
        }
    };

    return (
        <>
            <div className="view-cancha-card">
                <div className="cancha-media">
                    <img
                        src={cancha.imagen}
                        alt={cancha.nombre}
                        loading="lazy"
                        className="cancha-image"
                    />
                    <div className="price-badge">
                        <span className="price-amount">${cancha.precio}</span>
                        <span className="price-unit">/{formatUnit(cancha.horario.frecuencia)}</span>
                    </div>
                </div>

                <div className="cancha-content">
                    <h3 className="cancha-name">{cancha.nombre}</h3>

                    <div className="schedule-section">
                        <FiCalendar className="schedule-icon" />
                        <span>{formatHora(cancha.horario.horarioInicio)} - {formatHora(cancha.horario.horarioFin)}</span>
                    </div>

                    <div className="days-container">
                        {cancha.horario.diasDisponibles.split(',').map((d, i) => (
                            <span key={i} className="day-pill">{d.trim()}</span>
                        ))}
                    </div>

                    <div className="actions-container">
                        <button
                            className="details-btn"
                            onClick={() => setShowDisp(true)}
                        >
                            <FiInfo className="btn-icon" />
                            Detalles
                        </button>

                        <button
                            className="book-btn"
                            onClick={handleBook}
                        >
                            Reservar Ahora
                        </button>
                    </div>
                </div>
            </div>

            <DisponibilidadModal show={showDisp} onClose={() => setShowDisp(false)} cancha={cancha} />
            <ReservarModal show={showBook} onClose={() => setShowBook(false)} cancha={cancha} />
        </>
    );
};

export default ViewCanchaCard;