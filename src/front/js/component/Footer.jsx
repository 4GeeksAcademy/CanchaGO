import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt } from "react-icons/fa";
import logo from "../../img/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-white text-black py-4">
      <Container>
        <Row className="align-items-center">
          {/* Logo + Slogan */}
          <Col className="mb-3 mb-md-0 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <img 
                src={logo}
                alt="Logo Empresa" 
                width="100" 
                className="me-2"
              />
              <h5 className="mb-0">CanchaGO</h5>
            </div>
            <p className="small mt-2 mb-0">
              ¡Elige tu cancha, reúne a tu equipo y que empiece el partido!
               🏀⚽🎾
            </p>
          </Col>
          {/* Dirección */}
          <Col md={4} className="mb-3 mb-md-0 text-center">
            <div className="d-flex align-items-center justify-content-center">
              <FaMapMarkerAlt className="me-2" />
              <span>Av. Gran Mariscal de Ayacucho, Cumaná, Venezuela</span>
            </div>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="mt-3">
          <Col className="text-center">
            <p className="small mb-0">
              © {new Date().getFullYear()} CanchaGOve. Todos los derechos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;