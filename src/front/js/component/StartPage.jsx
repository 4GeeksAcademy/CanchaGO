import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import canchaGoImg from '../../img/CanchaGo img.jpg';


const StartPage = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <img src={canchaGoImg} alt="CanchaGO" className="cropped-logo" />
            <button onClick={() => navigate("/home")} className="btn-green">
                Ver Canchas Disponibles
            </button>
            <button onClick={() => navigate("/signup")} className="btn-blue">
                Sign Up
            </button>
            <button onClick={() => navigate("/login")} className="btn-blue">
                Login
            </button>
        </div>
    );
};
export default StartPage