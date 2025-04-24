from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Date, Time, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import LargeBinary


db = SQLAlchemy()

# ---------------------------- Usuario ----------------------------
class Usuario(db.Model):
    __tablename__ = 'usuario'

    idUsuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    clave: Mapped[str] = mapped_column(String(120), nullable=False)
    telefono: Mapped[str] = mapped_column(String(20), nullable=False)
    nombreUsuario: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)

    # Relaciones
    usuario_roles: Mapped[list["UsuarioRol"]] = relationship(
        'UsuarioRol', back_populates='usuario', lazy='select', cascade="all, delete"
    )
    reservas: Mapped[list["Reserva"]] = relationship(
        'Reserva', back_populates='usuario', lazy='select'
    )

    def serialize(self):
        return {
            'idUsuario': self.idUsuario,
            'nombre': self.nombre,
            'email': self.email,
            'telefono': self.telefono,
            'nombreUsuario': self.nombreUsuario,
            'roles': [ur.rol.nombre for ur in self.usuario_roles if ur.rol is not None],
            'reservas': [r.idReserva for r in self.reservas]
        }

# ---------------------------- Rol -------------------------------
class Rol(db.Model):
    __tablename__ = 'rol'

    idRol: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)

    # Relaciones
    usuario_roles: Mapped[list["UsuarioRol"]] = relationship(
        'UsuarioRol', back_populates='rol', lazy='select'
    )

    def serialize(self):
        return {
            'idRol': self.idRol,
            'nombre': self.nombre,
            'usuarios': [ur.usuario.nombreUsuario for ur in self.usuario_roles]
        }

# ------------------------ Usuario_Rol ---------------------------
class UsuarioRol(db.Model):
    __tablename__ = 'usuario_rol'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    idUsuario: Mapped[int] = mapped_column(ForeignKey('usuario.idUsuario'), nullable=False)
    idClub: Mapped[int] = mapped_column(ForeignKey('club.idClub'), nullable=True)
    idRol: Mapped[int] = mapped_column(ForeignKey('rol.idRol'), nullable=False)

    # Relaciones
    usuario: Mapped[Usuario] = relationship('Usuario', back_populates='usuario_roles')
    club: Mapped["Club"] = relationship('Club', back_populates='usuario_roles')
    rol: Mapped[Rol] = relationship('Rol', back_populates='usuario_roles')

    def serialize(self):
        return {
            'id': self.id,
            'usuario':  self.usuario.nombreUsuario,
            'club': self.club.nombre if self.club else "Sin club",
            'rol': self.rol.nombre
        }

# ---------------------------- Club ------------------------------
class Club(db.Model):
    __tablename__ = 'club'

    idClub: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    email : Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    telefono : Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    direccion: Mapped[str] = mapped_column(String(200), nullable=True)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    imagen: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)


    # Relaciones
    usuario_roles: Mapped[list[UsuarioRol]] = relationship(
        'UsuarioRol', back_populates='club', lazy='select',  cascade="all, delete"
    )
    club_deportes: Mapped[list["ClubDeporte"]] = relationship(
        'ClubDeporte', back_populates='club', lazy='select',  cascade="all, delete"
    )
    canchas: Mapped[list["Cancha"]] = relationship(
        'Cancha', back_populates='club', lazy='select' ,  cascade="all, delete"
    )

    def serialize(self):
        return {
            'idClub': self.idClub,
            'nombre': self.nombre,
            'email' : self.email,
            'telefono' : self.telefono,
            'direccion': self.direccion,
            'descripcion': self.descripcion,
            'personal': [ur.usuario.nombreUsuario for ur in self.usuario_roles],
            'deportes': [cd.deporte.nombre for cd in self.club_deportes],
            'canchas': [c.idCancha for c in self.canchas],
            'imagen': self.imagen.decode('latin1') if self.imagen else None
       
        }

# ------------------------ Club_Deporte --------------------------
class ClubDeporte(db.Model):
    __tablename__ = 'club_deporte'

    idClub: Mapped[int] = mapped_column(ForeignKey('club.idClub'), primary_key=True)
    idDeporte: Mapped[int] = mapped_column(ForeignKey('deporte.idDeporte'), primary_key=True)

    # Relaciones
    club: Mapped[Club] = relationship('Club', back_populates='club_deportes')
    deporte: Mapped["Deporte"] = relationship('Deporte', back_populates='club_deportes')

    def serialize(self):
        return {
            'club': self.club.nombre,
            'deporte': self.deporte.nombre
        }

# --------------------------- Deporte ----------------------------
class Deporte(db.Model):
    __tablename__ = 'deporte'

    idDeporte: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)

    # Relaciones
    club_deportes: Mapped[list[ClubDeporte]] = relationship(
        'ClubDeporte', back_populates='deporte', lazy='select'
    )
    canchas: Mapped[list["Cancha"]] = relationship(
        'Cancha', back_populates='deporte', lazy='select'
    )

    def serialize(self):
        return {
            'idDeporte': self.idDeporte,
            'nombre': self.nombre,
            'canchas': [c.idCancha for c in self.canchas]
        }

# -------------------------- Horario -----------------------------
class Horario(db.Model):
    __tablename__ = 'horario'

    idHorario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    horarioInicio: Mapped[str] = mapped_column(Time, nullable=False)
    horarioFin: Mapped[str] = mapped_column(Time, nullable=False)
    frecuencia: Mapped[str] = mapped_column(String(50), nullable=True)
    diasDisponibles: Mapped[str] = mapped_column(String(100), nullable=True)

    # Relaciones
    canchas: Mapped[list["Cancha"]] = relationship(
        'Cancha', back_populates='horario', lazy='select'
    )

    def serialize(self):
        return {
            'idHorario': self.idHorario,
            'horarioInicio': str(self.horarioInicio),
            'horarioFin': str(self.horarioFin),
            'frecuencia': self.frecuencia,
            'diasDisponibles': self.diasDisponibles
        }

# --------------------------- Cancha -----------------------------
class Cancha(db.Model):
    __tablename__ = 'cancha'

    idCancha: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    precio: Mapped[float] = mapped_column(nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean(), default=True, nullable=False)
    idClub: Mapped[int] = mapped_column(ForeignKey('club.idClub'), nullable=False)
    idHorario: Mapped[int] = mapped_column(ForeignKey('horario.idHorario'), nullable=False)
    idDeporte: Mapped[int] = mapped_column(ForeignKey('deporte.idDeporte'), nullable=False)

    # Relaciones
    club: Mapped[Club] = relationship('Club', back_populates='canchas')
    horario: Mapped[Horario] = relationship('Horario', back_populates='canchas')
    deporte: Mapped[Deporte] = relationship('Deporte', back_populates='canchas')
    reservas: Mapped[list["Reserva"]] = relationship(
        'Reserva', back_populates='cancha', lazy='select'
    )

    def serialize(self):
        return {
            'idCancha': self.idCancha,
            'nombre': self.nombre,
            'precio': self.precio,
            'estado': self.estado,
            'club': self.club.nombre,
            'horario': self.horario.serialize(),
            'deporte': self.deporte.nombre
        }

# -------------------------- Reserva -----------------------------
class Reserva(db.Model):
    __tablename__ = 'reserva'

    idReserva: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    idCancha: Mapped[int] = mapped_column(ForeignKey('cancha.idCancha'), nullable=False)
    idUsuario: Mapped[int] = mapped_column(ForeignKey('usuario.idUsuario'), nullable=False)
    fecha: Mapped[Date] = mapped_column(Date, nullable=False)
    horaInicio: Mapped[str] = mapped_column(Time, nullable=False)
    horaFin: Mapped[str] = mapped_column(Time, nullable=False)
    estado: Mapped[str] = mapped_column(String(50), nullable=False)
    monto: Mapped[float] = mapped_column(nullable=False)
    metodoPago: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relaciones
    cancha: Mapped[Cancha] = relationship('Cancha', back_populates='reservas')
    usuario: Mapped[Usuario] = relationship('Usuario', back_populates='reservas')

    def serialize(self):
        return {
            'idReserva': self.idReserva,
            'cancha': self.cancha.nombre,
            'usuario': self.usuario.nombreUsuario,
            'fecha': str(self.fecha),
            'horaInicio': str(self.horaInicio),
            'horaFin': str(self.horaFin),
            'estado': self.estado,
            'monto': self.monto,
            'metodoPago': self.metodoPago
        }
