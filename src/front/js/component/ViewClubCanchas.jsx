// ViewClubCanchas.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const ViewClubCanchas = () => {
  const { paddelId } = useParams();

  return (
    <div className="container mt-4">
      <h2>Canchas del Club ID: {paddelId}</h2>
      {/* Aquí puedes cargar dinámicamente las canchas del club usando el ID */}
      <p>(Aquí se mostrarán las canchas asociadas al club)</p>
    </div>
  );
};

export default ViewClubCanchas;
