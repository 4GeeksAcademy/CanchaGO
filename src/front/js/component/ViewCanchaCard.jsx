import React, { useState } from 'react';
import '../../styles/ViewCanchaCard.css';
import DisponibilidadModal from './DisponibilidadModal.jsx';
import ReservarModal from './ReservarModal.jsx';

const formatHora = h => h?.slice(0, 5) || '';
const formatUnit = f => f === '30min' ? '30 min' : 'hora';

const ViewCanchaCard = ({ cancha }) => {
    const [showDisp, setShowDisp] = useState(false);
    const [showBook, setShowBook] = useState(false);

    return (
        <>
            <div className="view-cancha-card">
                {/* Imagen de la cancha */}
                <div className="cancha-img">
                    <img src={cancha.imagen} alt={cancha.nombre} />
                </div>

                {/* Cuerpo de datos */}
                <div className="cancha-body">
                    <h3 className="cancha-name">{cancha.nombre}</h3>
                    <p className="cancha-price">
                        ${cancha.precio} / {formatUnit(cancha.horario.frecuencia)}
                    </p>
                    <p className="cancha-schedule">
                        {formatHora(cancha.horario.horarioInicio)} – {formatHora(cancha.horario.horarioFin)}
                    </p>
                    <div className="cancha-days">
                        {cancha.horario.diasDisponibles.split(',').map((d, i) => (
                            <span key={i} className="badge">{d.trim()}</span>
                        ))}
                    </div>
                </div>

                {/* Footer acciones */}
                <div className="cancha-footer">
                    <button className="btn details" onClick={() => setShowDisp(true)}>
                        Ver Detalles
                    </button>
                    <button className="btn book" onClick={() => setShowBook(true)}>
                        Reservar
                    </button>
                </div>
            </div>

            <DisponibilidadModal show={showDisp} onClose={() => setShowDisp(false)} cancha={cancha} />
            <ReservarModal show={showBook} onClose={() => setShowBook(false)} cancha={cancha} />
        </>
    );
};

export default ViewCanchaCard;