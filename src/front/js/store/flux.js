const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: null,
      role: null,
      username: null,
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

          //Si la respuesta esta bien
          if (response.ok) {
            //Transformamos la respuesta a objeto JS
            let data = await response.json();

            //Validamos los roles que tiene el usuario
            const userRole =
              data.roles && data.roles.length > 0 ? data.roles : null;

            let existeRol = false;
            //Validamos que la lista de roles no este vacia
            if (userRole !== null) {
              userRole.forEach((role) => {
                if (role === rol) {
                  existeRol = true;
                  return;
                }
              });
            }

            //Si el rol existe, guardamos el token en el store y el rol
            if (existeRol) {
              //Setteamos el store
              setStore({
                ...getStore(),
                token: data.token,
                role: rol,
                username: username,
              });

              return {
                success: true,
                message: "Login exitoso",
              };
            } else {
              return {
                success: false,
                message: "El rol no existe",
              };
            }
          } //Termina el if de response.ok
          else {
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
        setStore({ ...getStore(), token: null, role: null, username: null });
      },
      //Finaliza la funcion para iniciar sesion en la base de datos
      //----------------------------------------------------------------------------------------------------------------------------------------------------
    },
  };
};

export default getState;
