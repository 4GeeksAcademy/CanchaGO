import React, {createContext} from "react";
import DatosApi from "../store/DatosApi.jsx"

export const PaddelContext = createContext();

const data = {paddels: DatosApi }

console.log("Esta es la data", data)

const PaddelsProvider =({children})=>{
    return(
        <PaddelContext.Provider value={{data}}>
            {children}
        </PaddelContext.Provider>
    )

}


export default PaddelsProvider