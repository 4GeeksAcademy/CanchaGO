import React, { useState, useContext } from "react";
import "../../styles/login.css";
import { Context } from "../store/appContext.js";
import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAlert } from "../hooks/useAlert.js";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { error, success } = useAlert();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("Deportista");

    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
      
        if (!username || !password) {
          error("Por favor, completa todos los campos.");
          return;
        }
      
        try {
          const response = await actions.loginUser(username, password, userType);
          console.log("LOGIN RESPONSE:", response);
      
          if (response?.success) {
            success("Login exitoso");
            
            setTimeout(() => {
              if (response.role === "Propietario") {
                navigate("/Propietario"); 
              } else {
                navigate("/home");
              }
            }, 50);
          } else {
            error(response?.message || "Error desconocido");
            navigate("/");
          }
        } catch (err) {
          error("Error durante el login");
          navigate("/");
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
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="login-input"
                    />
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Clave"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Mostrar contraseña"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <button type="submit" className="btnblue">Ingresar</button>
                </form>
                <a href="/signup">No tienes cuenta? Registrate</a>
                <a href="/">Volver al inicio</a>
            </div>
        </div>
    );
};

export default Login;