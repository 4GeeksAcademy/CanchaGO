import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db, Rol
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Importa Blueprints directamente
after_blueprints = []
from api.routes.hello    import hello_bp
from api.routes.users    import users_bp

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
app.register_blueprint(hello_bp)
app.register_blueprint(users_bp)

#--------------------------------------------------------------------------------------------------------------

#Creamos los roles Deportista y Propietario si no existen cuando se inicia la app para que se agreguen a bd
def create_roles():
    
    #Crea los roles 
    for role_name in ("Deportista", "Propietario"):
        if not Rol.query.filter_by(nombre=role_name).first():
            db.session.add(Rol(nombre=role_name))
    db.session.commit()

# instanciamos
with app.app_context():
    create_roles()

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