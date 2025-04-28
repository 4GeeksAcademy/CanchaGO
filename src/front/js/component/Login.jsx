import React, { useState, useContext } from "react";
import "../../styles/login.css";

import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";
import { useAlert } from "../hooks/useAlert.js";


const Login = () => {

    //Manejo del hook para mostrar alertas
    const { error, success } = useAlert();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("Deportista");




    const handleLogin = async (e) => {

        //Validar que los campos no esten vacios
        if (!email || !password) {
            error("Por favor, completa todos los campos.");
            return;
        }


        // //Mandamos los datos al backend
        // let response = await actions.Login(email, password, userType);

        // if (response.success) {
        //     success("Login exitoso");
        //     navigate("/home");
        // }
        // else {
        //     error(response.message);
        // }
    };

    return (
        <div className="page-container">
            <div className="homeBox">
                <form onSubmit={handleLogin} className="login-form">
                    <div className="logo-container">
                        <img src={canchaLogoSinFondo} alt="CanchaGO" />
                    </div>

                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="login-input"
                    >
                        <option value="Deportista">Deportista</option>
                        <option value="Propietario">Propietario</option>
                    </select>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />
                    <input
                        type="clave"
                        placeholder="clave"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />
                    <button type="submit" className="btnblue">Ingresar</button>
                </form>
            </div>
        </div>
    );
};


export default Login;