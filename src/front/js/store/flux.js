const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      token: localStorage.getItem("token"),
      role: localStorage.getItem("role"),
      username: localStorage.getItem("username"),
      clubs: [],
      clubsDeportista: [],
      horarios_cancha: [],
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

              localStorage.setItem("token", data.token);
              localStorage.setItem("role", rol);
              localStorage.setItem("username", username);
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
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        setStore({
          ...getStore(),
          token: null,
          role: null,
          username: null,
          clubs: [],
        });
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
              message: data.error || "Error al crear el club",
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

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para crear una cancha en la base de datos

      createCancha: async (canchaData) => {
        try {
          const response = await fetch(process.env.BACKEND_URL + "cancha", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getStore().token,
            },
            body: JSON.stringify({
              nombre: canchaData.nombre,
              deporte: canchaData.deporte,
              dias: canchaData.dias,
              horaInicio: canchaData.horaInicio,
              horaFin: canchaData.horaFin,
              frecuencia: canchaData.frecuencia,
              precio: canchaData.precio,
              imagen: canchaData.imagen,
              estado: canchaData.estado,
              emailClub: canchaData.emailClub,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            return {
              success: true,
              message: "Cancha creada exitosamente",
            };
          } else {
            return {
              success: false,
              message: data.error || "Error al crear la cancha",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },

      //Finaliza la funcion para crear una cancha en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para eliminar una cancha en la base de datos
      deleteCancha: async (idCancha) => {
        try {
          const response = await fetch(
            process.env.BACKEND_URL + "cancha/" + idCancha,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getStore().token,
              },
            }
          );

          const data = await response.json();

          if (response.ok) {
            return {
              success: true,
              message: "Cancha eliminada exitosamente",
            };
          } else {
            return {
              success: false,
              message: data.error || "Error al eliminar la cancha",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },
      //Finaliza la funcion para eliminar una cancha en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para obtener todos los clubes disponibles en la base de datos

      getAllClubs: async () => {
        try {
          const response = await fetch(process.env.BACKEND_URL + "club/all", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + getStore().token,
            },
          });

          const data = await response.json();

          if (response.ok) {
            setStore({
              ...getStore(),
              clubsDeportista: data.clubs,
            });
            return {
              success: true,
              message: "Clubes obtenidos exitosamente",
              clubs: data.clubs,
            };
          } else {
            return {
              success: false,
              message: data.error || "Error al obtener los clubes",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },

      //Finaliza la funcion para obtener todos los clubes disponibles en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para obtener los horarios de una cancha en la base de datos

      getHorariosCancha: async (idCancha, fecha) => {
        try {
          const response = await fetch(
            process.env.BACKEND_URL + "reserva/cancha/disponibilidad",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                idCancha,
                fecha,
              }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            setStore({
              ...getStore(),
              horarios_cancha: data,
            });

            return {
              success: true,
              message: "Horarios obtenidos exitosamente",
              horarios: data.horarios,
            };
          } else {
            return {
              success: false,
              message: data.error || "Error al obtener los horarios",
            };
          }
        } catch (error) {
          console.error("Error:", error);
          return { success: false, message: "Error de conexión" };
        }
      },

      //Funcion para limpiar los horarios de una cancha en la base de datos
      clearHorariosCancha: () => {
        setStore({
          ...getStore(),
          horarios_cancha: [],
        });
      },

      //Finaliza la funcion para obtener los horarios de una cancha en la base de datos
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //-----------------------------------------------------------------------------------------------------------------------------------------------------
      //Stripe

      // Dentro de las actions de tu flux
      createCheckoutSession: async (reservaData) => {
        const { token } = getStore();
        const res = await fetch(
          process.env.BACKEND_URL + "reserva/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reservaData),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error creando checkout");
        return data.sessionId;
      },

      confirmReserva: async (sessionId) => {
        const { token } = getStore();
        const res = await fetch(
          process.env.BACKEND_URL + "reserva/confirm-reserva",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error confirmando reserva");
        return data.reserva;
      },

      // — Reserva temporal —
      setTempReserva: (data) => setStore({ ...getStore(), tempReserva: data }),
      clearTempReserva: () => setStore({ ...getStore(), tempReserva: null }),

      //Terminan las acciones de stripe
      //-----------------------------------------------------------------------------------------------------------------------------------------------------

      //------------------------------------------------------------------------------------------------------------------------------------------------------
      //Funcion para obtener las reservas de un usuario en la base de datos

      getUserReservations: async () => {
        const { token } = getStore();
        try {
          const resp = await fetch(
            process.env.BACKEND_URL + "reserva/usuario",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await resp.json();
          if (resp.ok) {
            setStore({ ...getStore(), userReservations: data });
            return { success: true, data };
          } else {
            return {
              success: false,
              message: data.error || "Error cargando reservas",
            };
          }
        } catch (error) {
          return { success: false, message: error.message };
        }
      },

      cancelReservation: async (idReserva) => {
        const { token } = getStore();
        try {
          const resp = await fetch(
            `${process.env.REACT_APP_API_URL}/reserva/${idReserva}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          if (resp.ok) {
            return { success: true };
          } else {
            const data = await resp.json();
            return {
              success: false,
              message: data.error || "Error cancelando reserva",
            };
          }
        } catch (error) {
          return { success: false, message: error.message };
        }
      },
      getCurrentUser: async () => {
        try {
          const token = getStore().token;
          if (!token) return { success: false, message: "No token available" };

          const response = await fetch(`${process.env.BACKEND_URL}users/userinfo`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const data = await response.json();
            return { success: false, message: data.msg || "Failed to fetch user" };
          }

          const data = await response.json();
          return { success: true, userData: data.usuario };
        } catch (error) {
          console.error("Error in getCurrentUser:", error);
          return { success: false, message: error.message };
        }
      },

      updateUserSettings: async (userData) => {
        try {
          const token = getStore().token;
          if (!token) return { success: false, message: "No token available" };

          const response = await fetch(`${process.env.BACKEND_URL}users/edit`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const data = await response.json();
            return { success: false, message: data.msg || "Failed to update user" };
          }

          const data = await response.json();
          return { success: true, userData: data.usuario };
        } catch (error) {
          console.error("Error in updateUserSettings:", error);
          return { success: false, message: "Server error" };
        }
      },


      //termina la funcion para obtener las reservas de un usuario en la base de datos
      //------------------------------------------------------------------------------------------------------------------------------------------------------
    },
  };
};

export default getState;
