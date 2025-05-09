import React, { useState, useContext, useEffect } from 'react';
import PaddelCard from './PaddelCard.jsx';
import { Context } from '../store/appContext.js';
import { useAlert } from '../hooks/useAlert.js';
import Navbar from './NavBar.jsx';
import '../../styles/ListPaddel.css';

const ListPaddel = () => {
  const { store, actions } = useContext(Context);
  const { success, error } = useAlert();

  const availableSports = ['Padel', 'Futbol', 'Tenis'];
  const [selectedSport, setSelectedSport] = useState('Padel');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 8;

  const getPagination = () => {
    const range = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      if (currentPage <= 3) {
        range.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return range;
  };

  useEffect(() => {
    cargarClubs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSport]);

  const cargarClubs = async () => {
    let response = await actions.getAllClubs();
    if (!response.success) {
      error(response.message || "Error al cargar los clubes");
    }
  };

  const handleSelectSport = (sport) => setSelectedSport(sport);

  const filteredClubs = store.clubsDeportista.filter(item =>
    item.deportes.includes(selectedSport)
  );

  const indexOfLast = currentPage * cardsPerPage;
  const indexOfFirst = indexOfLast - cardsPerPage;
  const currentClubs = filteredClubs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClubs.length / cardsPerPage);

  return (
    <>
      <Navbar />
      <div className="list-paddel-container">
        <div className="title-container">
          <h1 className="title-text">Clubs Deportivos</h1>
        </div>

        <div className="filter-container">
          {availableSports.map((sport) => (
            <button
              key={sport}
              className={`filter-btn ${selectedSport === sport ? 'active' : ''}`}
              onClick={() => handleSelectSport(sport)}
            >
              <span className="btn-content">{sport}</span>
            </button>
          ))}
        </div>

        <div className="clubs-scroll-container">
          {filteredClubs.length > 0 ? (
            <>
              <div className="clubs-wrapper">
                {currentClubs.map(item => (
                  <div className="club-card-wrapper" key={item.idClub}>
                    <PaddelCard paddel={item} selectedSport={selectedSport} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="page-btn arrow-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="arrow-icon">←</span>
                  </button>

                  {getPagination().map((page, index) =>
                    page === '...' ? (
                      <span key={index} className="page-ellipsis">• • •</span>
                    ) : (
                      <button
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    className="page-btn arrow-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">No hay clubs para {selectedSport}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ListPaddel;