import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ListPaddel from './component/ListPaddel.jsx';
import PaddelsProvider from './context/PaddelContext.jsx';
import Navbar from './component/NavBar.jsx';
import ProfessionalFooter from './component/Footer.jsx';
import Carousel from './component/Carousel.jsx'
import Loggin from './component/Loggin.jsx';

function App() {
  return (
    <div className="App">
        <PaddelsProvider>
            <Router>
               <Navbar/> 
              <Routes>
                  <Route path="/" element={<ListPaddel/>}/>
                  <Route path="/loggin" element={<Loggin/>}/>
                  <Route path="/miscanchas" element={<Carousel/>}/>
              </Routes>
            </Router>
          <ProfessionalFooter/>
        </PaddelsProvider>
    </div>
  );
}

export default App