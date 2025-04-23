import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const StartPage = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <img src="https://api.deepai.org/job-view-file/53943d41-f18c-48bc-a4f4-68f95f22fcb3/outputs/output.jpg" alt="CanchaGO" className="cropped-logo"/>
            <button onClick={() => navigate("/home")} className="btn-green">
                Ver Canchas Disponibles
            </button>
            <button onClick={() => navigate("/signup")} className="btn-blue">
                Sign Up
            </button>
        </div>
    );
};
export default StartPage