import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import { useAlert } from '../hooks/useAlert';

const ReservaExitosa = () => {
    const [q] = useSearchParams();
    const sessionId = q.get('session_id');
    const { actions } = useContext(Context);
    const { success, error } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionId) {
            navigate('/');
            return;
        }
        actions.confirmReserva(sessionId)
            .then(() => {
                success('¡Reserva creada exitosamente!');
                navigate('/MisReservas');
            })
            .catch(err => {
                error(err.message);
                navigate('/reservar-cancelado');
            });
    }, [sessionId]);

    return (
        <div className="text-center py-5">
            <h2>Procesando tu reserva…</h2>
            <div className="spinner-border text-primary mt-3" role="status" />
        </div>
    );
};

export default ReservaExitosa;
