import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import ListPaddel from './component/ListPaddel.jsx';
import PaddelsProvider from './context/PaddelContext.jsx';
import Navbar from './component/NavBar.jsx';
import ProfessionalFooter from './component/Footer.jsx';
import Carousel from './component/Carousel.jsx';
import Loggin from './component/Loggin.jsx';
import StartPage from './component/StartPage.jsx';
import { ToastContainer } from "react-toastify";
import Login from './component/Login.jsx';
import injectContext from "./store/appContext.js";
import Propietario from './component/Propietario.jsx'
import ViewCanchas from './component/ViewCanchas.jsx';



const AppContent = () => {
  const location = useLocation();
  const hideLayout = location.pathname === "/" ||
    location.pathname === "/signup" ||
    location.pathname === "/login" ||
    location.pathname === "/Propietario" ||
    location.pathname.startsWith("/Canchas/");

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/home" element={<ListPaddel />} />
        <Route path="/Propietario" element={<Propietario />} />
        <Route path="/Canchas/:clubEmail" element={<ViewCanchas />} />
        <Route path="/signup" element={<Loggin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/miscanchas" element={<Carousel />} />
      </Routes>
      {!hideLayout && <ProfessionalFooter />}

      {/* Para alertsa y notificaciones de la app */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

// 2️⃣ Ahora envolvemos ese component con nuestro HOC de Flux/Context:
const AppContentWithFlux = injectContext(AppContent);

// Add this class to your main App container
function App() {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <PaddelsProvider>
        <Router>
          <AppContentWithFlux />
        </Router>
      </PaddelsProvider>
    </div>
  );
}

export default App;
