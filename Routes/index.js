const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const kitRoute = require('../Controllers/KitController');
const turnoRoute = require('../Controllers/TurnoController');
const userRoute = require('../Controllers/UserController');
const TeamRoute = require('../Controllers/TeamController');
const ActivityRoute = require('../Controllers/ActivityController');

const upload = require('../middleware/multer');
const passport = require('passport');

//middleware para escoger el rol permitido
function verifyRole(role){
    return (req,res,next)=>{
        
        if(req.user.role == role){
            next();
        }else{
            return res.status(401).send(`no tienes acceso <a href='/home' class='btn-redirect'>regresar</a>`);
        }
    }
}

router.get('/home', (req,res)=>{
    let isConnected = true;
    if(!req.cookies.token || req.cookies.token === '')
        isConnected = false;
        res.render('home', {user: req.user, isConnected});
})
//gets userController
router.get('/login', userRoute.see);
router.get('/register', userRoute.newUserForm);
router.get('/menu', passport.authenticate('jwt', {session: false}), userRoute.getMenu);


router.post('/api/login', userRoute.login);
router.post('/api/adminRegister',(req,res,next)=>{ const {role} = req.body
if(role != 'alumno' || role != null) res.status(401).send();}, userRoute.register);
router.post('/api/register', userRoute.register);
router.delete('/logout', (req,res,next)=>{
    req.cookies.token = '';
    res.status(200).send();
})



//gets kitController
router.get('/kit/add',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), kitRoute.see);
router.get('/kit/addHU',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), kitRoute.seeHU);
router.get('/kit/showKits', passport.authenticate('jwt', {session: false}),verifyRole('profesor'), kitRoute.seeKits);
router.get('/kit/:id/show', kitRoute.seeKit);
router.get('/kit/addBox', passport.authenticate('jwt', {session: false}),verifyRole('profesor'),kitRoute.seeBox);

router.post('/kit/api/add',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), kitRoute.addKit);
router.post('/kit/api/addHU',passport.authenticate('jwt', {session: false}),verifyRole('profesor'),upload.single('imageUrl'),kitRoute.addHU);
router.post('/kit/api/addBox',passport.authenticate('jwt', {session: false}),verifyRole('profesor'),upload.array('manualUrl',5),kitRoute.addBox);

router.delete('/kit/api/removeHU',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), kitRoute.removeHU);
router.delete('/kit/api/removeBox', passport.authenticate('jwt', {session: false}),verifyRole('profesor'), kitRoute.removeBox);

//gets turnoController
router.get('/turno/addTurno',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), turnoRoute.seeCreateTurno);
router.get('/turno/:id/show',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), turnoRoute.seeTurno);

router.put('/turno/api/:idTurn/startActivity',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), turnoRoute.startActivity );

router.post('/turno/api/add',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), turnoRoute.createTurno);

router.post('/turno/join',passport.authenticate('jwt', {session: false}),verifyRole('alumno'),turnoRoute.joinTurn);
router.put('/turno/api/:id/update', passport.authenticate('jwt', {session: false}),verifyRole('profesor'), turnoRoute.updateTurno);

router.get('/activity/:idTurno/session',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), ActivityRoute.seeTeacherActivity);
router.get('/activity/:idTurno/play',passport.authenticate('jwt', {session: false}),verifyRole('alumno'), ActivityRoute.seeStudentActivity);
router.post('/activity/api/:idTurno/addHUTeam',passport.authenticate('jwt', {session: false}),verifyRole('alumno'), ActivityRoute.addHUTeam);
router.post('/activity/api/:idTurno/addHUSprint',passport.authenticate('jwt', {session: false}),verifyRole('alumno'), ActivityRoute.addHUSprint);
router.post('/activity/api/:idTurno/addResultSprint',passport.authenticate('jwt', {session: false}),verifyRole('alumno'),upload.single('fileInput'), ActivityRoute.addResultSprint);
router.put('/activity/api/:idTurno/verifyResultSM',passport.authenticate('jwt', {session: false}),verifyRole('alumno'), ActivityRoute.verifyResultSM);
router.put('/activity/api/:idTurno/verifyResult',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), ActivityRoute.verifyResult);
router.put('/activity/api/:idTurno/nextPhase',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), ActivityRoute.continueActivity);


//teamController
router.get('/turno/:id/showTeams', passport.authenticate('jwt', {session: false}), TeamRoute.getTeams);
router.get('/team/:id/showTeam', passport.authenticate('jwt', {session: false}), TeamRoute.showTeam);

router.post('/api/:id/joinTeam/:idTeam',passport.authenticate('jwt', {session: false}),verifyRole('alumno'), TeamRoute.joinTeam);
router.delete('/api/removeStudent/:idTeam',passport.authenticate('jwt', {session: false}),verifyRole('profesor'), TeamRoute.removeTeam);

module.exports = router;


