import React, { useState, useContext, useEffect } from 'react';
import PaddelCard from './PaddelCard.jsx';
import { Context } from '../store/appContext.js';
import { useAlert } from '../hooks/useAlert.js';
import Navbar from './NavBar.jsx';
import '../../styles/ListPaddel.css';

const ListPaddel = () => {

    //Importamos el contexto de la app
    const { store, actions } = useContext(Context);

    // Importamos el hook de alertas
    const { success, error } = useAlert();

    // Opciones de filtro de deporte
    const availableSports = ['Padel', 'Futbol', 'Tenis'];

    // Solo un deporte seleccionado a la vez
    const [selectedSport, setSelectedSport] = useState('Padel');

    useEffect(() => {

        cargarClubs();

    }, []);

    const cargarClubs = async () => {

        //Cargamos los clubes desde la API
        let response = await actions.getAllClubs();

        if (response.success) {
            //  success("Clubs cargados correctamente");
        }
        else {
            error(response.message || "Error al cargar los clubes");
        }

    }

    // Cambiar deporte seleccionado
    const handleSelectSport = (sport) => {
        setSelectedSport(sport);
    };

    // Filtrar clubes según deporte
    const filteredClubs = store.clubsDeportista.filter(item =>
        item.deportes.includes(selectedSport)
    );

    return (
        <>
            <Navbar />
            <div className="list-paddel-container">
                <h1 className="list-paddel-title">Clubs</h1>

                {/* Filtro de deportes */}
                <div className="filter-container">
                    {availableSports.map((sport) => (
                        <button
                            key={sport}
                            className={`filter-btn ${selectedSport === sport ? 'active' : ''}`}
                            onClick={() => handleSelectSport(sport)}
                        >
                            {sport}
                        </button>
                    ))}
                </div>

                {/* Contenedor de clubes filtrados */}
                <div className="clubs-scroll-container">
                    {filteredClubs.length > 0 ? (
                        <div className="clubs-wrapper">
                            {filteredClubs.map(item => (
                                <div className="club-card-wrapper" key={item.idClub}>
                                    <PaddelCard paddel={item} selectedSport={selectedSport} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">No hay clubs para {selectedSport}</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ListPaddel;
