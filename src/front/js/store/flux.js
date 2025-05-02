const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: null,
      role: null,
      username: null,
      clubs: [],
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

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para obtener los clubes de un usuario

      getClubsByUser: async () => {
        try {
          const response = await fetch(
            process.env.BACKEND_URL + "club/usuario",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getStore().token,
              },
            }
          );

          const data = await response.json();

          if (response.ok) {
            if (response.status === 204) {
              setStore({
                ...getStore(),
                clubs: [],
              });
              return {
                success: success,
                message:
                  "No tienes clubes registrados para el usuario " +
                  getStore().username,
              };
            } else {
              setStore({
                ...getStore(),
                clubs: data.clubs,
              });
              return {
                success: true,
                message: "Clubes obtenidos exitosamente",
              };
            }
          } else {
            return {
              success: false,
              message: "Error al obtener los clubes, " + data.message,
            };
          }
        } catch (error) {
          return {
            success: false,
            message: "Error al obtener los clubes : " + error.message,
          };
        }
      },
      //Finaliza la funcion para obtener los clubes de un usuario
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para crear un club en la base de datos

      createClub: async (clubData) => {
        try {
          console.log("Club Data:", clubData);
          const response = await fetch(
            process.env.BACKEND_URL + "club/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getStore().token,
              },
              body: JSON.stringify({
                nombre: clubData.nombre,
                descripcion: clubData.descripcion,
                deportes: clubData.deportes,
                imagen: clubData.imagen,
                direccion: clubData.direccion,
                googleMapsLink: clubData.googleMapsLink,
                email: clubData.email,
                telefono: clubData.telefono,
              }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            return {
              success: true,
              message: "Club creado exitosamente",
            };
          } else {
            return {
              success: false,
              message: data.message || "Error al crear el club",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },

      //Finaliza la funcion para crear un club en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para editar un club en la base de datos

      editClub: async (clubData) => {
        console.log("Club Data:", clubData);
        try {
          const response = await fetch(process.env.BACKEND_URL + "club/edit", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getStore().token,
            },
            body: JSON.stringify({
              nombre: clubData.nombre,
              descripcion: clubData.descripcion,
              deportes: clubData.deportes,
              imagen: clubData.imagen,
              direccion: clubData.direccion,
              googleMapsLink: clubData.googleMapsLink,
              email: clubData.email,
              telefono: clubData.telefono,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            return {
              success: true,
              message: "Club editado exitosamente",
            };
          } else {
            return {
              success: false,
              message: data.message || "Error al editar el club",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },

      //Finaliza la funcion para editar un club en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para eliminar un club en la base de datos

      deleteClub: async (email) => {
        try {
          const response = await fetch(process.env.BACKEND_URL + "club", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getStore().token,
            },
            body: JSON.stringify({
              email: email,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setStore({
              ...getStore(),
              clubs: getStore().clubs.filter((c) => c.email !== email),
            });
            return {
              success: true,
              message: "Club eliminado exitosamente",
            };
          } else {
            return {
              success: false,
              message: data.message || "Error al eliminar el club",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },

      //Finaliza la funcion para eliminar un club en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------
    },
  };
};

export default getState;
