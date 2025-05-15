import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt } from "react-icons/fa";
import canchaLogoSinFondo from "../../img/canchago-sinfondo.png";

const Footer = () => {
  return (
    <footer className="bg-white text-black pt-2 pb-0 mb-0  border-top">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="mb-2 mb-md-0 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <div className="logoContainer">
                <img src={canchaLogoSinFondo} alt="CanchaGO" />
              </div>
            </div>
            <p className="small mt-1 mb-0">
              <span className="text-nowrap">
                ¡Elige tu cancha, reúne a tu equipo y que empiece el partido! ⚽🎾🏓
              </span>
            </p>
          </Col>

          <Col md={4} className="mb-2 mb-md-0 text-center">
            <div className="d-flex align-items-center justify-content-center">
              <FaMapMarkerAlt className="me-1 small" />
              <span className="small">WorldWide</span>
            </div>
          </Col>

          <Col md={4} className="text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end">
              <a href="#" className="text-black mx-1">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-black mx-1">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-black mx-1">
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col className="text-center">
            <p className="small mb-0 text-muted">
              © {new Date().getFullYear()} CanchaGO. Todos los derechos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
