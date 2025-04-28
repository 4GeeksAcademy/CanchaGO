const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: null,
    },
    actions: {
      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para crear un usuario en la base de datos
      createUser: (email, password) => {},

      //Finaliza la funcion para crear un usuario en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para iniciar sesion en la base de datos

      loginUser: async (email, clave, rol) => {
        try {
          let response = await fetch(process.env.BACKEND_URL + "users/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              clave: clave,
              rol: rol,
            }),
          });

          if (response.ok) {
            let data = await response.json();
            setStore({ ...getStore(), token: data.token });
            return {
              success: true,
              message: "Login exitoso",
              token: data.token,
            };
          } else {
            let data = await response.json();
            return {
              success: false,
              message: data.msg,
            };
          }
        } catch (error) {
          console.error("Error en la solicitud:", error);
          return {
            success: false,
            message: "Error en la solicitud" + error,
          };
        }
      },

      //Finaliza la funcion para iniciar sesion en la base de datos
      //----------------------------------------------------------------------------------------------------------------------------------------------------
    },
  };
};

export default getState;
