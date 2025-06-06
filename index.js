const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const routes = require('./Routes/index');


const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const dotenv = require('dotenv');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('./middleware/passport');




const app = express();
app.use(cookieParser());

// Configurar middleware
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method', { methods: ["POST", "GET"] }));
app.set('view engine', 'ejs');
app.set('views');
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Rutas

app.use('/',routes);


// Ruta principal
app.get('/', (req, res) => {
    res.redirect('/home');
});



//middleware para manejar tokens
function verificarToken(req,res,next){
    const envPath = path.resolve(process.cwd() + "/.vscode/", '.env');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envConfig = dotenv.parse(envContent);
    if(envConfig.TokenId){
        const decoded = jwt.verify(envConfig.TokenId,'secret');
        req.user = decoded;
        next();
    }
    
}

// Middleware para manejar errores
defaultErrorHandler = (error, req, res, next) => {
    console.error("Error:", error.message || error);
    res.status(500).send("Error interno del servidor");
};
app.use(defaultErrorHandler);

// Servidor
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;