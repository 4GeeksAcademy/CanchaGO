import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const Login = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Seleccionar Tipo de Usuario");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Por favor complete todos los campos");
      return;
    }
    
    if (userType === "Seleccionar Tipo de Usuario") {
      setError("Por favor seleccione un tipo de usuario");
      return;
    }

    try {
      const response = await fetch(`https://psychic-robot-45rr7v5w94w3qr5q-3001.app.github.dev/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreUsuario: username, 
          clave: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Error en el login");
      }

      if (!data.roles.includes(userType)) {
        throw new Error(`No tienes permisos como ${userType}`);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRoles", JSON.stringify(data.roles));
      localStorage.setItem("username", username);

      if (userType === "Propietario") {
        navigate("/home");
      } else if (userType === "Deportista") {
        navigate("/home");
      }

    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
        <input
          type="text" 
          placeholder="Nombre de usuario" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <div className="dropdown">
          <button
            className="btn btn-green dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {userType}
          </button>
          <ul className="dropdown-menu">
            <li>
              <a 
                className="dropdown-item" 
                href="#" 
                onClick={() => setUserType("Propietario")}
              >
                Propietario
              </a>
            </li>
            <li>
              <a 
                className="dropdown-item" 
                href="#" 
                onClick={() => setUserType("Deportista")}
              >
                Deportista
              </a>
            </li>
          </ul>
        </div>
        <button type="submit" className="btn-blue">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
