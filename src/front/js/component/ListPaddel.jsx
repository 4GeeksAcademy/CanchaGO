// ListPaddel.jsx
import React, { useState, useContext, useEffect } from 'react';
import PaddelCard from './PaddelCard.jsx';
import { Context } from '../store/appContext.js';
import { useAlert } from '../hooks/useAlert.js';
import Navbar from './NavBar.jsx';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../../styles/ListPaddel.css';

const ListPaddel = () => {
  const { store, actions } = useContext(Context);
  const { error } = useAlert();

  const availableSports = ['Padel', 'Futbol', 'Tenis'];
  const [selectedSport, setSelectedSport] = useState('Padel');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;

  useEffect(() => {
    const cargarClubs = async () => {
      try {
        await actions.getAllClubs();
      } catch (err) {
        error("Error al cargar los clubes");
      }
    };
    cargarClubs();
  }, []);

  const filteredClubs = Array(cardsPerPage).fill().map((_, index) =>
    store.clubsDeportista
      .filter(item => item.deportes.includes(selectedSport))
    [index + ((currentPage - 1) * cardsPerPage)] || null
  );

  const totalPages = Math.ceil(
    store.clubsDeportista.filter(item => item.deportes.includes(selectedSport)).length / cardsPerPage
  );

  return (
    <>
      <Navbar />
      <div className="list-paddel-container">
        <div className="header-section">
          <div className="title-wrapper">
            <h1>Clubs Deportivos <span className="gradient-text">Premium</span></h1>
            <p className="subtitle">Experiencias deportivas de alto nivel</p>
          </div>

          <div className="controls-container">
            <div className="sport-filters">
              {availableSports.map((sport) => (
                <button
                  key={sport}
                  className={`sport-filter ${selectedSport === sport ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSport(sport);
                    setCurrentPage(1);
                  }}
                >
                  {sport}
                  <div className="filter-indicator"></div>
                </button>
              ))}
            </div>

            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="nav-icon" />
              </button>
              <span className="page-indicator">
                <span className="current-page">{currentPage}</span>
                <span className="total-pages">/{totalPages}</span>
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight className="nav-icon" />
              </button>
            </div>
          </div>
        </div>

        <div className="cards-carousel">
          <div className="cards-wrapper">
            {filteredClubs.map((item, index) => (
              item ? (
                <PaddelCard key={item.idClub} paddel={item} selectedSport={selectedSport} />
              ) : (
                <div key={`placeholder-${index}`} className="card-placeholder"></div>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListPaddel;