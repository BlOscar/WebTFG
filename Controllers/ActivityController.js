const {Turn} = require("../Models/Turn");
const {Kit} = require("./../Models/Kit");
const {User} = require("../Models/User");
const {Team} = require("../Models/Team");
const { DATE } = require("sequelize");
const {TeamRole} = require('../enums/teamRoles');
const { LegoBox } = require("../Models/LegoBox");
const { ManualBox } = require("../Models/ManualBox");
const { HU } = require("../Models/HistoriaUsuario");
const { Sprint } = require("../Models/Sprint");
const { Result } = require("../Models/Result");


exports.seeTeacherActivity = async (req,res,next)=>{
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: 
                                    {model: Team, required: true, include: 
                                        {model: Sprint, required: false, include: {
                                            model: Result, required: true, include:{
                                                model: HU, required: true
                                                }
                                            }
                                        }
                                    }});
    let isValidate = false;
    let state;
    const teams = turn.teams;

    switch(turn.state){
        case 0:
            //Presentacion
            state = ['Presentacion', teams, 5*60];
            break;
        case 1:
            //Lectura de instrucciones
            state = ['Lectura de instrucciones', teams, 7*60];
            break;
        case 2:
            //priorizar pila
            state = ['Priorizacion Pila', teams, 5*60];
            break;
        case 3:
            //planificar Sprint
            state = ['Planificar Sprint', teams, 12*60];
            break;
        case 4:
            //ejecucion Sprint
            state = ['Ejecucion Sprint', teams, 20*60];
            break;
        case 5:
            //Revision
            state = ['Revision', teams, 6*60];
            isvalidate = true;
            break;
        case 6:
            //Retrospectiva
            state = ['Retrospectiva', teams, 5*60];
            break;
        default: 
            throw Error;
        
    }
    res.render('activity/centralActivity.ejs', {turn, state, isValidate});

}

exports.seeStudentActivity = async (req,res,next) =>{
    
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    const team = turn.teams[0];
    const teamHU = await HU.findAll({include: {model: Team, where: {id: team.id}, required: true}});
    const kit = await Kit.findOne({where: {id: team.kitId}, include: [
                                            {model: LegoBox, required: true, include:  
                                                {model: ManualBox, require: true}}, {model: HU, required: true}]});
    const manuals = kit.legoBox.manualBoxes;
    const Hus = refillHUs(teamHU, kit.HUs);
    turn.state = 4;
    const view = req.query.view?.split('_')[0];
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
                [TeamRole.ProductOwner]: ['Necesidades','manual_PO']
            };
            if(view && !allowedViewsRead[role]?.some(p=> p.includes(view))){
                return res.status(404).send();           
            }
            state = ['Lectura de instrucciones',role];
            instructions = representScenarioRead(role, view);
            views = allowedViewsRead[role];
            
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view, kit, manuals});

            break;
        case 2:
            //priorizar pila
            const allowedViewsPriorize = {
                [TeamRole.Developer]: ['Instrucciones','manual_Dev'],
                [TeamRole.ScrumMaster]: ['verHUs','manual_SM'],
                [TeamRole.ProductOwner]: ['Necesidades','verHUs','manual_PO']
            };
            if(view && !allowedViewsPriorize[role]?.some(p=> p.includes(view))){
                return res.status(404).send();           
            }
            state = ['Priorizacion Pila', role];
            instructions = representScenarioRead(role, view);
            views = allowedViewsPriorize[role];
            
            const poWrite = true;
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view, kit, manuals, Hus, poWrite, devWrite: false, SMWrite: false});

            break;
        case 3:
            //planificar Sprint
            const allowedViewsPlan = {
                [TeamRole.Developer]: ['Instrucciones','verHUs','manual_Dev', 'sprintVisual'],
                [TeamRole.ScrumMaster]: ['verHUs','manual_SM','sprintVisual'],
                [TeamRole.ProductOwner]: ['Necesidades','verHUs','manual_PO','sprintVisual']
            };
            if(view && !allowedViewsPlan[role]?.some(p=> p.includes(view))){
                return res.status(404).send();           
            }
            state = ['Planificar Sprint', role];
            instructions = representScenarioRead(role, view);
            views = allowedViewsPlan[role];
            const sprints = await Sprint.findOne({include: [{model: Team, required: true}, {model: HU, required: true}]});
            
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view, kit, manuals, Hus, poWrite: false, devWrite: true, SMWrite: true, HuSprints: sprints.HUs});

            break;
        case 4:
            //ejecucion Sprint
            const allowedViewsEjecution = {
                [TeamRole.Developer]: ['Instrucciones','verHUs','manual_Dev', 'sprintVisual'],
                [TeamRole.ScrumMaster]: ['verHUs','manual_SM','sprintVisual'],
                [TeamRole.ProductOwner]: ['Necesidades','verHUs','manual_PO','sprintVisual']
            };
            if(view && !allowedViewsEjecution[role]?.some(p=> p.includes(view))){
                return res.status(404).send();           
            }
            state = ['Ejecucion Sprint', role];
            instructions = representScenarioRead(role, view);
            views = allowedViewsEjecution[role];
            const sprintsE = await Sprint.findOne({include: [{model: Team, required: true}, {model: HU, required: true}]});
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view, kit, manuals, Hus, poWrite: false, devWrite: false, SMWrite: true, HuSprints: sprintsE.HUs});

            break;
        case 5:
            //Revision
            const allowedViewsReview = {
                [TeamRole.Developer]: ['Instrucciones','manual_Dev', 'sprintVisual'],
                [TeamRole.ScrumMaster]: ['manual_SM','sprintVisual'],
                [TeamRole.ProductOwner]: ['Necesidades','manual_PO','sprintVisual']
            };
            if(view && !allowedViewsReview[role]?.some(p=> p.includes(view))){
                return res.status(404).send();           
            }            
            state = ['Ejecucion Sprint', role];
            instructions = representScenarioRead(role, view);
            views = allowedViewsReview[role];
            const sprintsR = await Sprint.findOne({include: [{model: Team, required: true}, {model: HU, required: true}]});
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view, kit, manuals, devWrite: false, SMWrite: false, HuSprints: sprintsR.HUs});


            break;
        case 6:
            //Retrospectiva
            const allowedViewsR = {
                [TeamRole.Developer]: ['Instrucciones','manual_Dev', 'Retrospectiva'],
                [TeamRole.ScrumMaster]: ['manual_SM','Retrospectiva'],
                [TeamRole.ProductOwner]: ['Necesidades','manual_PO','Retrospectiva']
            };
            if(view && !allowedViewsR[role]?.some(p=> p.includes(view))){
                return res.status(404).send();           
            }
            state = ['Retrospectiva', role];
            instructions = representScenarioRead(role, view);
            views = allowedViewsR[role];
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view, kit, manuals,SMWrite: true});
            break;
        default: 
            throw Error;
    }

}
function refillHUs(teamHU, hus){
    let huSelected = []
    for(let i = 0; i<hus.length; i++){
        let temp = teamHU.find(p=> p.id === hus[i].id);
        if(teamHU && temp){
            
            huSelected.push({
                id: hus[i].id,
                name: hus[i].name,
                description: hus[i].description,
                imageUrl: hus[i].imageUrl,
                size: temp.teams[0].TeamHU.size,
                priority: temp.teams[0].TeamHU.priority
            })
        }else{
            huSelected.push({
                id: hus[i].id,
                name: hus[i].name,
                description: hus[i].description,
                imageUrl: hus[i].imageUrl,
                size: 0,
                priority: 0
            })
        }
    }
    return huSelected;
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

exports.addResultSprint = async(req,res)=>{
    const {idHU} = req.body;
    const fileInput = req.file;
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    const role = turn.teams[0].users[0].TeamStudent.role;
    const team = turn.teams[0];
    if(role === TeamRole.Developer && /*turn.state*/4 === 4){
        const sprint = await Sprint.findOne({include: [{model: Team,where: {id: team.id}, required: true}, {model: HU, required: false}]});
        const temp = await Result.findOne({include: [{model: HU, where:{id: idHU}, required: true},{model: Sprint, where: {id: sprint.id}, required: true}]});
        const hu = await HU.findOne({where: {id: idHU}});
        if(!temp){
            const result = await Result.create({urlimage: fileInput.path});
            await sprint.addResult(result);
            await hu.addResult(result);
        }
        
    }
}

exports.verifyResultSM = async(req,res)=>{
    const {idHU} = req.body;
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    const role = turn.teams[0].users[0].TeamStudent.role;
    const team = turn.teams[0];
    if(role === TeamRole.ScrumMaster){
        const sprint = await Sprint.findOne({include: [{model: Team,where: {id: team.id}, required: true}, {model: HU, required: false}]});
        const temp = await Result.findOne({include: [{model: HU, where:{id: idHU}, required: true},{model: Sprint, where: {id: sprint.id}, required: true}]});
        if(temp){
            temp.SMValidation = true;
            await temp.save();
        }
    }
}

exports.verifyResult = async(req,res)=>{
    const {idResult, isValidated} = req.body;
    const result = await Result.findOne({where: {id: idResult}});
    if(result){
        if(isValidated){
            result.ClientValidation = true;
            await result.save();
        }else{
            await result.destroy();
        }
    }
}

exports.addHUSprint = async (req,res,next)=>{
    const {huId} = req.body;
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    const role = turn.teams[0].users[0].TeamStudent.role;
    const team = turn.teams[0];
    if(role === TeamRole.ScrumMaster){
        const Hu = await HU.findOne({where: {id:huId}, include:  {model: Team, where: {id: team.id}, required: true}});
        if(!Hu){
            return res.staus(404).send();
        }
        let sprint = await Sprint.findOne({where: {name: `${turn.id}-${team.id}`},include: [{model: Team,where: {id: team.id}, required: true}, {model: HU, required: false}]});
        if(!sprint){
            sprint = await Sprint.create({name: `${turn.id}-${team.id}`, objetive: '', improvement: '', teamId: team.id});
            await sprint.addHU(Hu, {through: {position: 1}});
        }else{
            const lenght = sprint.HUs.length;
            await sprint.addHU(Hu, {through: {position: lenght+1}});
        }
    }
}
exports.addHUTeam = async (req,res,next)=>{
    const {huId, priority, size} = req.body;
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    const role = turn.teams[0].users[0].TeamStudent.role;
    const Hu = await HU.findOne({where: {id:huId}});
    if(!Hu){
        return res.staus(404).send();
    }
    const team = turn.teams[0];
    const HUTeam = await HU.findOne({where: {id:huId}, include:{model: Team, where: {id: team.id}}});
    if(HUTeam && role === TeamRole.Developer){
        if(size > 0 && !priority){
            HUTeam.teams[0].TeamHU.size = size;
            await HUTeam.teams[0].TeamHU.save();
        }
    }else if(!HUTeam && role === TeamRole.ProductOwner){
        //solamente puede ser cuando esta con el PO
        await team.addHU(Hu, {through: {priority: 1, size: 0}});
    }
    
}

exports.continueActivity = async (req,res,next) =>{
    const turn = await Turn.findOne({where: {id: req.params.idTurn}});
    turn.state += 1;
    return res.status(200).send();

}