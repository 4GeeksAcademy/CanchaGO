import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/index.css";
import canchaLogo from "../../img/canchago.png";
import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";

const StartPage = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="homeBox">
                <div className="logo-container">
                    <img src={canchaLogoSinFondo} alt="CanchaGO" />
                </div>
                <button onClick={() => navigate("/home")} className="btngreen">
                    Ver Canchas Disponibles
                </button>
                <button onClick={() => navigate("/signup")} className="btnblue">
                    Sign Up
                </button>
                <button onClick={() => navigate("/login")} className="btnblue">
                    Login
                </button>
            </div>
        </div>
    );
};
export default StartPage