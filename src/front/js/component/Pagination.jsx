const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="pagination-container">
            <Button
                variant="outline-dark"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                &laquo; Anterior
            </Button>

            <span className="page-info">
                Página {currentPage} de {totalPages}
            </span>

            <Button
                variant="outline-dark"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Siguiente &raquo;
            </Button>
        </div>
    );
};