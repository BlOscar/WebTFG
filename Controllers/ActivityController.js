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
const socket = require('../middleware/socket');
const fs = require("fs");


exports.seeTeacherActivity = async (req,res,next)=>{
    try{
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
        case -1:
            state = ['Finalizacion Actividad', teams];
        break;
        case 0:
            //Presentacion
            state = ['Presentacion', teams];
            break;
        case 1:
            //Lectura de instrucciones
            state = ['Lectura de instrucciones', teams];
            break;
        case 2:
            //priorizar pila
            state = ['Priorizacion Pila', teams];
            break;
        case 3:
            //planificar Sprint
            state = ['Planificar Sprint', teams];
            break;
        case 4:
            //ejecucion Sprint
            state = ['Ejecucion Sprint', teams];
            break;
        case 5:
            //Revision
            state = ['Revision', teams];
            isValidate = true;
            break;
        case 6:
            //Retrospectiva
            state = ['Retrospectiva', teams];
            break;
        default: 
            throw Error;
        
    }
    res.render('activity/centralActivity.ejs', {turn, state, isValidate, timer: turn.timeLeftState.toISOString(), user: req.user});
    }catch(err){
        console.log(err);
    }

}

exports.seeStudentActivity = async (req,res,next) =>{
    try{
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    if(!turn){
        return res.status(404).send();

    }
    const team = turn.teams[0];
    const teamHU = await HU.findAll({include: {model: Team, where: {id: team.id}, required: true}});
    
    const kit = await Kit.findOne({where: {id: team.kitId}, include: [
                                            {model: LegoBox, required: true, include:  
                                                {model: ManualBox, require: true}}, {model: HU, required: true}]});
    if(!teamHU || !kit){
        return res.status(404).send();
    }
    const Hus = refillHUs(teamHU, kit.HUs);
    const view = req.query.view?.split('_')[0];
    const role = team.users[0].TeamStudent.role;
    let instructions = '';
    let views = [];
    switch(turn.state){
        case -1:
            state = ['Finalizacion Actividad', team.users[0].TeamStudent.role];
            res.render('activity/Lecture.ejs', {turn,state,view: null, views: null, instructions: null});
            break;
        case 0:
            //Presentacion
            state = ['Presentacion', team.users[0].TeamStudent.role];
            res.render('activity/Lecture.ejs', {turn, state, view: null, views: null, instructions: null});
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
            
            res.render('activity/Lecture.ejs', {turn, state, instructions, views, view, kit});

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
            instructions = representScenarioPriorize(role);
            views = allowedViewsPriorize[role];
            
            const poWrite = true;
            res.render('activity/Lecture.ejs', {turn, state, instructions: instructions[0], views, view, kit, Hus, poWrite: instructions[2], devWrite: instructions[1], SMWrite: instructions[3]});

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
            instructions = representScenarioPlan(role, view);
            views = allowedViewsPlan[role];
            const sprints = await Sprint.findOne({include: [{model: Team, where: {id: team.id}, required: true}, {model: HU, required: true}]});
            
            res.render('activity/Lecture.ejs', {turn, state, instructions: instructions[0], views, view, kit, Hus, poWrite: instructions[2], devWrite: instructions[1], SMWrite: instructions[3], HuSprints: sprints?.HUs});

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
            const sprintsE = await Sprint.findOne({include: [{model: Team, where: {id: team.id}, required: true}]});
            const HuSprint = await Sprint.findOne({where: {id: sprintsE.id},include: [{model: HU, required:true, include: {model:Result, where: {SprintId: sprintsE.id},required: false}}]});
            instructions = representScenarioSprint(role);
            views = allowedViewsEjecution[role];
            res.render('activity/Lecture.ejs', {turn, state, instructions: instructions[0], views, view, kit, Hus, poWrite: instructions[2], devWrite: instructions[1], SMWrite: instructions[3], HuSprints: HuSprint.HUs});

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
            instructions = representScenarioReview();
            views = allowedViewsReview[role];
            const sprintsR = await Sprint.findOne({include: [{model: Team, where: {id: team.id}, required: true}]});
            const HuSprints = await Sprint.findOne({where: {id: sprintsR.id},include: [{model: HU, required:true, include: {model:Result, where: {SprintId: sprintsR.id},required: false}}]});
            res.render('activity/Lecture.ejs', {turn, state, instructions: instructions[0], views, view, kit,Hus, poWrite: instructions[2], devWrite: instructions[1], SMWrite: instructions[3], HuSprints: HuSprints.HUs});


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
            instructions = representScenarioR(role, view);
            views = allowedViewsR[role];
            res.render('activity/Lecture.ejs', {turn, state, instructions: instructions[0], views, view, kit,SMWrite: instructions[3]});
            break;
        default: 
            throw Error;
    }
    }catch(err){
        console.log(err);
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
function representScenarioPlan(role, view){
    let temp;
    switch(role){
        case TeamRole.Developer: 
            temp = `En esta fase os encargareis de estimar el tamaño de las Historias de usuario siguiendo la tecnica de Planning Poker. Además, junto con el Product Owner, escogereis la pila de historias de usuario que seguirá el sprint `
                    if(view === 'sprintVisual'){
                                    return [temp,false,false,false];

                    }else{
                                    return [temp,true,false,false];

                    }
    

            break;
        case TeamRole.ProductOwner:
            temp  =    `En esta fase ayudarás a los desarrolladores en la pila del Sprint, ademas de escribir el objetivo que tiene este Sprint`
                return [temp,false,false,false];

            break;
        case TeamRole.ScrumMaster:
            temp = `En esta fase te encargarás de proporcionar las tarjetas para realizar la tecnica de Planning Poker y de ser un mediador para que la actividad se haga lo mas eficiente posible.`
                return [temp,false,false,true];

            break;
    }

}
function representScenarioSprint(role){
    let temp;
    switch(role){
        case TeamRole.Developer: 
            temp = `En esta fase os encargareis hacer las construcciones LEGO de las piezas que habeis escogido en la pila del Sprint, y debereis de tomar una foto y subirlo a la pagina para que el Scrum Master pueda validarlo.`;
                return [temp,true,false,false]

            break;
        case TeamRole.ProductOwner:
            temp = `En esta fase te encargarás de validar las construcciones que hayan realizado los desarrolladores y estarás en ocntacto con el Cliente por si tiene alguna pregunta. Tu no puedes participar en el Scrum diario.`;
                return [temp,false,false,false]

            break;
        case TeamRole.ScrumMaster:
            temp = `En esta fase te encargarás avisar sobre los Scrums diarios y de revisar las construcciones. Aunque el Product Owner se encargaría de revisar las construcciones, tu serás el que lo validará desde la aplicacion web.`;
                return [temp,false,false,true]

            break;
    }
}
function representScenarioReview(role){
    return [`En esta fase os encargareis de enseñar al Cliente las estructuras que hayais realizado durante el transcurso del Sprint`, false, false, false];
}
function representScenarioPriorize(role){
    let temp;
    switch(role){
        case TeamRole.Developer: 
            temp = `En esta fase seguireis leyendo las instrucciones de la actividad que se os ha proporcionado y tambien vereis los manuales de las cajas LEGO que teneis en 'Instrucciones. `;
            return [temp,false,false,false]
            break;
        case TeamRole.ProductOwner:
            temp = `En esta fase te encargarás, junto con el Scrum Master, de realizar la priorización de las historias de usuarios que teneis en el kit.
            Hay que tener en cuenta que solo tú puedes leer las necesidades del Cliente y ademas te encargarás de escribir la priorización con la técnica MoSCoW.
            \nM: Must
            \nS: Should
            \nC: Could
            \nW: Won't`;
            return [temp,false,true,false]

            break;
        case TeamRole.ScrumMaster:
            temp = `En esta fase te encargarás de ayudar al Product Owner con la priorización de las historias de Usuario.
            Ten en cuenta que el Product Owner tiene que emplear la tecnica de priorización MoSCoW, que consiste en priorizar siguiendo estos terminos:
            \nMust have (M). Características que necesariamente tienen que estar 
            presentes en el elemento.  
            \nShould have (S): Características de alta prioridad que, aunque no son 
            imprescindibles, deberían estar presentes en el elemento.  
            \nCould have (C): Características deseables, pero no necesarias. 
            \nWont have (W): Características que pueden ser descartadas por el 
            momento, pero que en el futuro podrían ser reconsideradas e incluidas en 
            alguna de las otras categorías. `;
            return [temp,false,false,false]

            break;
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
function representScenarioR(role, view){
    let temp;
    switch(role){
        case TeamRole.Developer: 
            temp = `En esta fase el equipo deberá de comunicarse entre ellos sobre los problemas que han surgido durante el Sprint y como se han solventado.\n
            Adicionalemente, el Scrum Master tendrá que subir el burdown chart creado anteriormente e introducir las mejoras que podrian haber hecho durante el transcuros del Sprint. `;
            return [temp,false,false,false]
        case TeamRole.ProductOwner: 
            temp = `En esta fase el equipo deberá de comunicarse entre ellos sobre los problemas que han surgido durante el Sprint y como se han solventado.\n
            Adicionalemente, el Scrum Master tendrá que subir el burdown chart creado anteriormente e introducir las mejoras que podrian haber hecho durante el transcuros del Sprint. `;
            return [temp,false,false,false]
        case TeamRole.ScrumMaster: 
            temp = `En esta fase el equipo deberá de comunicarse entre ellos sobre los problemas que han surgido durante el Sprint y como se han solventado.\n
            Adicionalemente, tendrás que subir el burdown chart creado anteriormente e introducir las mejoras que podrían haber hecho durante el transcuros del Sprint. `;
            return [temp,false,false,false]
    }
}

exports.addResultSprint = async(req,res)=>{
        const {idHU} = req.body;
        const fileInput = req.file;
        const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
        const role = turn.teams[0].users[0].TeamStudent.role;
        const team = turn.teams[0];
    try{
        
        if(role === TeamRole.Developer && turn.state === 4){
            const sprint = await Sprint.findOne({include: [{model: Team,where: {id: team.id}, required: true}, {model: HU, required: false}]});
            const temp = await Result.findOne({include: [{model: HU, where:{id: idHU}, required: true},{model: Sprint, where: {id: sprint.id}, required: true}]});
            const hu = await HU.findOne({where: {id: idHU}});
            if(!temp){
                const result = await Result.create({urlimage: fileInput.path, sprintId: sprint.id});

                    await hu.addResult(result);
                    return res.status(200).send();
            }
            
        }
    }catch(err){
        console.log("Ha habido un error en la creacion del resultado" + err);
        fs.unlink(fileInput.path, error=>{
                    if(error) 
                        console.log('error al eliminar', error)
                    });
        return res.status(500).send();
    }
    
}
exports.eliminateResultSM = async(req,res)=>{
    try{
        const {idHU} = req.body;
        const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
        const role = turn.teams[0].users[0].TeamStudent.role;
        const team = turn.teams[0];
        if(role === TeamRole.ScrumMaster){
            const sprint = await Sprint.findOne({include: [{model: Team,where: {id: team.id}, required: true}, {model: HU, required: false}]});
            const temp = await Result.findOne({include: [{model: HU, where:{id: idHU}, required: true},{model: Sprint, where: {id: sprint.id}, required: true}]});
            fs.unlink(temp.urlimage, error=>{
                    if(error) 
                        console.log('error al eliminar', error);
                        return res.status(500).send();
                    });
                
            await temp.destroy();
            return res.status(200).send();
        }else{
            return res.status(401).send();
        }
    }catch(err){
        console.log("Ha habido un error en la verificacion del resultado " + err);
        return res.status(500).send();
    }
}

exports.verifyResultSM = async(req,res)=>{
    try{
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
                return res.status(200).send();
            }
        }
    }catch(err){
        console.log("Ha habido un error en la verificacion del resultado" + err);
        return res.status(500).send();
    }
}

exports.verifyResult = async(req,res)=>{
    try{
        const {idResult} = req.body;
        const result = await Result.findOne({where: {id: idResult}});
        if(result){
            
            result.ClientValidation = true;
            await result.save();
            return res.status(200).send();
        }
    }catch(err){
        console.log("Ha habido un error en la verificacion del resultado" + err);
        return res.status(500).send();
    }
}

exports.addHUSprint = async (req,res,next)=>{
    const {huId} = req.body;
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    const role = turn.teams[0].users[0].TeamStudent.role;
    const team = turn.teams[0];
    try{
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
            return res.status(200).send();
        }
    }catch(err){
        console.log("Ha habido un error en la creacion del sprint" + err);
        return res.status(500).send();
    }
    
}
exports.addHUTeam = async (req,res,next)=>{
    const {huId, priority, size} = req.body;
    const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
    const role = turn.teams[0].users[0].TeamStudent.role;
    const Hu = await HU.findOne({where: {id:huId}});
    if(!turn || !Hu){
        return res.staus(404).send();
    }
    try{
        const team = turn.teams[0];
        const HUTeam = await HU.findOne({where: {id:huId}, include:{model: Team, where: {id: team.id}}});
        if(HUTeam && role === TeamRole.Developer){
            if(size > 0 && !priority){
                HUTeam.teams[0].TeamHU.size = size;
                await HUTeam.teams[0].TeamHU.save();
            }
            return res.status(200).send();
        }else if(!HUTeam && role === TeamRole.ProductOwner){
            //solamente puede ser cuando esta con el PO
            await team.addHU(Hu, {through: {priority: priority, size: 0}});
            return res.status(200).send();

        }
    }catch(err){
        console.log("Ha habido un error en la creacion del sprint" + err);
        return res.status(500).send();
    }
    
    
}

exports.addImprovement = async (req,res,next)=>{
    const {improvement} = req.body;
    const burdownImage = req.file;
    try{
        const turn = await Turn.findOne({where: {id: req.params.idTurno}, include: {model: Team, required: true, include: {model: User, where: {id: req.user.id}, required: true}}});
        const team = turn.teams[0];
        const sprint = await Sprint.findOne({include: {model: Team, where:{id: team.id}, required: true}});
        const result = await Result.findOne({include: {model: Sprint, where: {id: sprint.id}, required: true}});
        sprint.improvement = improvement;
        result.burdownChart = burdownImage.path;
        await sprint.save();
        await result.save();
        return res.status(200).send();
    }catch(err){
        console.log("Ha habido un error en la implementacion", err);
        fs.unlink(burdownImage.path, error=>{
                    if(error) 
                        console.log('error al eliminar', error)
                    });
                    return res.status(500).send();
    }
    

}

exports.continueActivity = async (req,res,next) =>{
    const turn = await Turn.findOne({where: {id: req.params.idTurno}});
    if(turn.state === 6){
        turn.state = -1;
        turn.codeTurn = '';
    }else{
        turn.state += 1;
        turn.timeLeftState = getTime(turn)

    }
    await turn.save();
    socket.continueActivity(turn.id);

    return res.status(200).send();

}

function getTime(turn){
    var date = new Date().getTime();
    switch(turn.state){
        case 1:
            return new Date(date + 7*60*1000);
        case 2:
            return new Date(date + 5*60*1000);
        case 3:
            return new Date(date + 12*60*1000);
        case 4:
            return new Date(date + 20*60*1000);
        case 5:
            return new Date(date + 6*60*1000);
        case 6:
            return new Date(date + 5*60*1000);
}
}