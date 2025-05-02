import React, { useContext } from 'react'
import PaddelCard from './PaddelCard.jsx'
import {PaddelContext} from '../context/PaddelContext.jsx'

const ListPaddel = () => {
  const {data} = useContext(PaddelContext)
  console.log("desde destructuracion", data)
  console.log("Una sola propiedad", data.paddels[0])

  return (
    <div className='container pt-4' style={{ overflowX: 'auto' }}>
      
        <div className='d-flex flex-row flex-nowrap' style={{ width: 'max-content' }}>
            {data.paddels.map(item => (
                <div className="px-2" key={item.id}>
                    <PaddelCard
                        paddel={item}  
                    />
                </div>
            ))}
        </div>
    </div>
  )


}

export default ListPaddel