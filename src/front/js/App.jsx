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


const AppContent = () => {
  const location = useLocation();
  const hideLayout = location.pathname === "/" || location.pathname === "/signup" || location.pathname === "/login";

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/home" element={<ListPaddel />} />
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

function App() {
  return (
    <div className="App">
      <PaddelsProvider>
        <Router>
          <AppContentWithFlux />
        </Router>
      </PaddelsProvider>
    </div>
  );
}

export default App;
