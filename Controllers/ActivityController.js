const {Turn} = require("../Models/Turn");
const {Kit} = require("./../Models/Kit");
const {User} = require("../Models/User");
const {Team} = require("../Models/Team");
const { DATE } = require("sequelize");
const {TeamRole} = require('../enums/teamRoles');


exports.seeTeacherActivity = async (req,res,next)=>{
    const turn = await Turn.findOne({where: {id: req.params.idTurn}, include: {model: Team, required: true}});
    let state;
    const teams = turn.team;
    switch(turn.state){
        case 0:
            //Presentacion
            state = ['Presentacion', teams, 5];
            break;
        case 1:
            //Lectura de instrucciones
            state = ['Lectura de instrucciones', teams, 7];
            break;
        case 2:
            //priorizar pila
            state = ['Priorizacion Pila', teams, 5];
            break;
        case 3:
            //planificar Sprint
            state = ['Planificar Sprint', teams, 12];
            break;
        case 4:
            //ejecucion Sprint
            state = ['Ejecucion Sprint', teams, 20];
            break;
        case 5:
            //Revision
            state = ['Revision', teams, 6];
            break;
        case 6:
            //Retrospectiva
            state = ['Retrospectiva', teams, 5];
            break;
        default: 
            throw Error;
    }
    res.render();

}

exports.seeStudentActivity = async (req,res,next) =>{
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, require: true}}});
    const team = turn.teams[0];
    turn.state = 2;
    const view = req.query.view;
    const role = team.users[0].TeamStudent.role;
    let instructions = '';
    let views = [];
    switch(turn.state){
        case 0:
            //Presentacion
            state = ['Presentacion', team.users[0].TeamStudent.role];
            break;
        case 1:
            //Lectura de instrucciones
            
            const allowedViewsRead = {
                [TeamRole.Developer]: ['Instrucciones','manual_Dev'],
                [TeamRole.ScrumMaster]: ['manual_SM'],
                [TeamRole.ProductOwner]: ['manual_PO']
            };
            if(view && !allowedViewsRead[role]?.includes(view)){
                return res.status(404).send();           
            }
            state = ['Lectura de instrucciones',role];
            instructions = representScenarioRead(role, view);
            views = allowedViewsRead[role];
            break;
        case 2:
            //priorizar pila
            const allowedViewsPriorize = {
                [TeamRole.Developer]: ['Instrucciones','manual_Dev'],
                [TeamRole.ScrumMaster]: ['manual_SM'],
                [TeamRole.ProductOwner]: ['manual_PO']
            };
            state = ['Priorizacion Pila'];
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view});

            break;
        case 3:
            //planificar Sprint
            state = ['Planificar Sprint'];
            break;
        case 4:
            //ejecucion Sprint
            state = ['Ejecucion Sprint'];
            break;
        case 5:
            //Revision
            state = ['Revision'];
            break;
        case 6:
            //Retrospectiva
            state = ['Retrospectiva'];
            break;
        default: 
            throw Error;
    }

}
function representScenarioRead(role, view){
    
            
    switch(role){
        case TeamRole.Developer: 
            
            return `Cuando terminéis de leer estas instrucciones, empezar a consultar los manuales de 
instrucciones de Lego. En estos manuales se detallan paso a paso los procesos a 
seguir para construir diferentes figuras o estructuras con las piezas de Lego que 
habéis recibido. Todavía no tenéis manera de saber qué tenéis que construir ni que 
piezas de Lego necesitaréis para ello, pero consultar el manual os servirá para poder 
estimar con más precisión el tamaño de las historias de usuario durante la 
planificación del Sprint. Estos manuales solo pueden ser consultados por los 
desarrolladores, por lo que no podéis mostrárselos ni dejárselos ni al Product Owner 
ni al Scrum Master. Podéis consultar los manuales en todo momento.  
Podéis dedicar el tiempo del que dispongáis hasta que dé comienzo la planificación 
del Sprint a leer los manuales. La responsabilidad de que este evento comience en el 
momento adecuado y se realice de la manera adecuada es del Scrum Master.`
        case TeamRole.ScrumMaster:
            return `Cuando termines de leer estas instrucciones espera a que el Product Owner termine 
de leer las suyas si no lo ha hecho todavía. Después, comenzar juntos el paso 3. 
La última página proporciona información específica sobre cómo realizar un 
Planning Poker y elaborar un burndown chart. No es necesario que leas ahora esta 
página, puedes consultarla posteriormente en el momento que lo necesites. `;
        case TeamRole.ProductOwner:
            return `Cuando termines de leer estas instrucciones espera a que el Scrum Master termine 
de leer las suyas si no lo ha hecho todavía. Después, comenzar juntos el paso 3.`;

        
    }
}

exports.continueActivity = async (req,res,next) =>{
    const turn = await Turn.findOne({where: {id: req.params.idTurn}});
    turn.state += 1;
    return res.status(200).send();

}