const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: null,
      role: null,
      username: null 
    },
    actions: {
      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para crear un usuario en la base de datos
      createUser: async (userData) => {
        try {
          const response = await fetch(
            process.env.BACKEND_URL + "users/signup",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                nombre: userData.nombre,
                email: userData.email,
                clave: userData.clave,
                nombreUsuario: userData.nombreUsuario,
                telefono: userData.telefono,
                rol: userData.rol,
              }),
            }
          );

          const data = await response.json();
          if (response.ok) {
            return {
              success: true,
              message: "Usuario registrado exitosamente",
            };
          } else {
            return {
              success: false,
              message: data.msg || "Error en el registro",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },

      //Finaliza la funcion para crear un usuario en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para iniciar sesion en la base de datos

      loginUser: async (username, clave, rol) => {
        try {
          let response = await fetch(process.env.BACKEND_URL + "users/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombreUsuario: username,
              clave: clave,
              rol: rol,  
            }),
          });
      
          if (response.ok) {
            let data = await response.json();            
      
            const userRole = data.roles && data.roles.length > 0 ? data.roles[0] : null;
      
            setStore({ 
              token: data.token,
              role: userRole,
              username: username 
            });
      
            return {
              success: true,
              message: "Login exitoso",
              token: data.token,
              role: userRole  
            };
          } else {
            let data = await response.json();
            return {
              success: false,
              message: data.msg || "Error en el login",
            };
          }
        } catch (error) {
          console.error("Error en la solicitud:", error);
          return {
            success: false,
            message: "Error en la solicitud: " + error.message,
          };
        }
      },
      
      logoutUser: () => {
        setStore({ token: null, role: null, username: null });
      }
      //Finaliza la funcion para iniciar sesion en la base de datos
      //----------------------------------------------------------------------------------------------------------------------------------------------------
    },
  };
};

export default getState;
