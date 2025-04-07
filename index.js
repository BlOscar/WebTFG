const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const userRoutes = require('./Routes/userRoute');
const quizRoutes = require('./Routes/QuizRoute');
const kitRoutes = require('./Routes/KitRoute');
const turnoRoutes = require('./Routes/TurnoRoute');


const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const dotenv = require('dotenv');




const app = express();

// Configurar middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method', { methods: ["POST", "GET"] }));
app.set('view engine', 'ejs');
app.set('views');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Rutas
app.use('/users', userRoutes);
app.use('/quizzes', quizRoutes);
app.use('/kits', kitRoutes);
app.use('/turnos', turnoRoutes);
app.get('/home', verificarToken, (req,res)=>{
    res.render('home', {user: req.user});
})

// Ruta principal
app.get('/', (req, res) => {
    res.redirect('/users/login');
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