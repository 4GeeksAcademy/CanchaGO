import React, { useState, useContext } from "react";
import "../../styles/login.css";
import { Context } from "../store/appContext.js";
import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";
import { useAlert } from "../hooks/useAlert.js";
import { useNavigate } from "react-router-dom";


const Login = () => {

    //Manejo del hook para mostrar alertas
    const { error, success } = useAlert();

    //Variables del formulario
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("Deportista");

    //Cotexto y navegacion
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();
        //Validar que los campos no esten vacios
        if (!username || !password) {
            error("Por favor, completa todos los campos.");
            return;
        }

        //Mandamos los datos al backend
        let response = await actions.loginUser(username, password, userType);

        if (response.success) {
            success("Login exitoso");
            navigate("/home");
        }
        else {
            error(response.message);
        }
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
                        type="username"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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