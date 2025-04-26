import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate, upgrade
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db, Rol, Deporte
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from datetime import timedelta
from sqlalchemy import inspect

# Importa Blueprints directamente
after_blueprints = []
from api.routes.users    import users_bp
from api.routes.club     import club_bp

from api.routes.reserva  import reserva_bp
from api.routes.cancha   import cancha_bp

env = 'development' if os.getenv('FLASK_DEBUG') == '1' else 'production'
port = int(os.getenv('PORT', 3001))
base_dir = os.path.dirname(os.path.realpath(__file__))
static_dir = os.path.join(base_dir, '../public')

app = Flask(__name__, static_folder=None)
CORS(app)
app.url_map.strict_slashes = False

# Configuración de BD
db_uri = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(base_dir, '../sqlite/test.db')}" )
app.config['SQLALCHEMY_DATABASE_URI']        = db_uri.replace('postgres://', 'postgresql://')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
Migrate(app, db, compare_type=True)

# Configuraciones de JWT
app.config["JWT_SECRET_KEY"] = "clave-secreta"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

# Admin UI y CLI
setup_admin(app)
setup_commands(app)

# Registro de Blueprints
app.register_blueprint(users_bp)
app.register_blueprint(club_bp)
app.register_blueprint(reserva_bp)
app.register_blueprint(cancha_bp)


#--------------------------------------------------------------------------------------------------------------

#Creamos los roles Deportista y Propietario si no existen cuando se inicia la app para que se agreguen a bd
def create_roles():
    
    #Crea los roles 
    for role_name in ("Deportista", "Propietario"):
        if not Rol.query.filter_by(nombre=role_name).first():
            db.session.add(Rol(nombre=role_name))
    db.session.commit()

#Creamos los deportes
def create_deportes():
    #Crea los deportes
    for deporte_name in ("Futbol", "Tenis", "Padel"):
        if not Deporte.query.filter_by(nombre=deporte_name).first():
            db.session.add(Deporte(nombre=deporte_name))
    db.session.commit()

def is_db_ready():
    inspector = inspect(db.engine)
    # Verificamos si las tablas principales existen
    tables = inspector.get_table_names()
    return 'rol' in tables and 'deporte' in tables

# instanciamos
with app.app_context():

    if is_db_ready():
        # Si la base de datos ya existe, actualizamos el esquema
        upgrade()
        create_roles()
        create_deportes()

#--------------------------------------------------------------------------------------------------------------



# Manejo de errores
@app.errorhandler(APIException)
def handle_api_error(error):
    return jsonify(error.to_dict()), error.status_code

# Sitemap y SPA
@app.route('/')
def sitemap():
    if env == 'development':
        return generate_sitemap(app)
    return send_from_directory(static_dir, 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    target = path if os.path.isfile(os.path.join(static_dir, path)) else 'index.html'
    resp   = send_from_directory(static_dir, target)
    resp.cache_control.max_age = 0
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=(env=='development'))