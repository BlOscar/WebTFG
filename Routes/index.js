const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const kitRoute = require('../Controllers/KitController');
const turnoRoute = require('../Controllers/TurnoController');
const userRoute = require('../Controllers/UserController');
const upload = require('../middleware/multer');

//middleware para escoger el rol permitido
function selectRole(role){
    return (req,res,next)=>{
        req.role = role;
        next();
    }
}

//get para comprobar token
router.post('/api/verify-token',userRoute.verifyToken)

//gets userController
router.get('/login', userRoute.see);
router.get('/register', userRoute.newUserForm);
router.get('/menu', userRoute.getMenu);

router.post('/api/login', userRoute.login);
router.post('/api/register', userRoute.register);


//gets kitController
router.get('/kit/add', kitRoute.see);
router.get('/kit/addHU', kitRoute.seeHU);
router.get('/kit/:id/show', kitRoute.seeKit);
router.get('/kit/addBox',kitRoute.seeBox);

router.post('/kit/api/add', kitRoute.addKit);
router.post('/kit/api/addHU',upload.single('imageUrl'),kitRoute.addHU);
router.post('/kit/api/addBox',upload.array('manualUrl',5),kitRoute.addBox);

//gets turnoController
router.get('/turno/addTurno', turnoRoute.seeCreateTurno);
router.get('/turno/:id/show', turnoRoute.seeTurno);

router.post('/turno/api/add', turnoRoute.createTurno);

module.exports = router;


