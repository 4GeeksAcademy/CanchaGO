import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import Navbarpropietario from './Navbarpropietario.jsx';
import CrearCanchaCard from './CrearCanchaCard.jsx';

const Propietario = () => {
  const navigate = useNavigate();
  const { store } = useContext(Context);

  useEffect(() => {
    console.log("PROPIETARIO CHECK:", {
      token: store.token,
      role: store.role,
      required: "Propietario"
    });
    
    if (!store.token || store.role !== "Propietario") {
      console.log("REDIRECTING TO HOME");
      navigate('/');
    }
  }, [navigate, store]);

  return (
    <div>
      <Navbarpropietario />
      {/* <div className="min-h-screen w-screen bg-gray-100 flex items-center justify-center">
        <CrearCanchaCard />
      </div> */}
    </div>
  );
};

export default Propietario;