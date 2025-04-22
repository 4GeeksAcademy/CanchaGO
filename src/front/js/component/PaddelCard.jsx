import React from 'react'
import { useNavigate } from 'react-router-dom';

const PaddelCard = ({paddel}) => {
      const navigate = useNavigate();

    const handleOpenMaps = () => {
        window.open("https://www.google.com/maps/place/SPORT+CLUB+CUMANA/@10.475372,-64.182726,15.8z/data=!4m6!3m5!1s0x8c327142e6530fb1:0xfc91a4671b4cd5bc!8m2!3d10.4756809!4d-64.178186!16s%2Fg%2F11l77bqscb?entry=ttu&g_ep=EgoyMDI1MDQxMy4wIKXMDSoJLDEwMjExNjQwSAFQAw%3D%3D", "_blank");
      };

      const handleImageClick = () => {
        navigate('/miscanchas')
      };
      const handleLooginClick = () => {
        navigate('/loggin')
      };

  return (
        <div className="card" style={{'width': '400px'}}>
            <img src= {paddel.imageUrl}
            className="card-img-top bg-primary"
            alt={paddel.title}
            style={{width: '400px', height:'200px', objectFit:'cover',  cursor: 'pointer'}}
            onClick={handleImageClick}
            />
            <div className="card-body">
                <h4>{paddel.title}</h4>
                <hr />
                <h6> Direccion</h6>
                <h6> Detalles</h6>
                <div className="d-flex justify-content-between ">
                    <button 
                    className='btn btn-light btn-outline-secondary' 
                    onClick={handleLooginClick}>
                        Reservar
                    </button>
                    <button
                        className='btn btn-light btn-outline-secondary'
                        variant="outline-primary" 
                        onClick={handleOpenMaps}
                        >
                        Ver en Google Maps
                    </button>
                </div>
            </div>
        </div>
  )
}


export default PaddelCard