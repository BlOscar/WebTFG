const {Turn} = require("../Models/Turn");
const {Kit} = require("./../Models/Kit");
const {User} = require("../Models/User");


const {Team} = require("../Models/Team");
const { Op } = require('sequelize');
const { HU } = require("../Models/HistoriaUsuario");
const RandExp = require('randexp');
const socket = require('../middleware/socket');



exports.seeTurno = (async (req,res,next)=>{
    try{
        const idTurn = req.params.id;
        const kitsTurns = await Turn.findAll({where: {id: idTurn}, include : Kit});
        const kits = await Kit.findAll();
        let kitsLeft = [];
        let kitsAdded = [];
        kitsTurns.forEach(e=>{
            kitsAdded = e.kits;
        });
        let temp;
        for(let i = 0; i<kits.length; i++){
            const y = kits[i];
            temp = await kitsAdded.find((e) => e.id == y.id);
            if(!temp){
                kitsLeft.push(y);
            }else{
                y.quantity = temp.TurnKit.quantity;
                kitsLeft.push(y);
            }
        }
        const teams = await Team.findAll({include: {
            model: Turn,
            where: {id: idTurn},
        }});
        const turns = await Turn.findOne({where: {id:idTurn},include: {model: User, where: {role: 'alumno'}, required: true} });
        const students = turns?.users;
        
        
        if(Number.isNaN(idTurn)) 
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        const turn = await Turn.findOne({where: {id: idTurn}});
        if(!turn)
            return res.status(404).send();
        res.render('users/Profesor/menuTurno.ejs', {turn, kitsAdded, kitsLeft, teams, students, name: req.user.username});

    }catch(err){
        console.log(err);
    }
})
exports.updateTurno = (async(req,res,next) =>{
        const {startDate, kitList} = req.body;
        const idTurn = req.params.id;
    if(Number.isNaN(idTurn)) 
        return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
    const turn = await Turn.findOne({where: {id: idTurn}, include: {model: Kit, required: true}});
    if(!turn)
        return res.status(404).send();
    if(startDate){ 
        if(startDate <= new Date()){
            return res.status(400).json({error: "se tiene que añadir una fecha valida"});
        }else{
            await turn.update({startDate});
        }
    }
    kitList.forEach(async kita=>{
        var kit = await Kit.findByPk(kita[0]);
        turn.hasKit(kit)
        .then(async exists =>{
            if(!exists){
                turn.addKit(kit);
            }else{
                const temp = await turn.getKits({where: {id: kit.id}});
                
                temp[0].TurnKit.quantity = kita[1];
                await temp[0].TurnKit.save();
            }
        })
    })
    return res.status(200).send();

})
function checkKits(kits, kitToDelete, operator){
    let temp;
    kits.forEach(e=>{
        e.kits.forEach(async ev =>{
            temp = await kitToDelete.findOne({where: {id: ev.id}})
            if(temp == operator){
                return false;
            }
        })
    });
    return true;
}
exports.removeTurn = (async(req,res,next)=>{
    const turnid = req.params.idTurn;
    try{
        const turn = await Turn.findOne({where:{id: turnid}, include: {model:Team, required: true}});
        
        if(turn){
            await turn.setUsers([]);
            await turn.setKits([]);
            await Team.destroy({where: {turnId: turn.id}});
            await turn.destroy();
            return res.status(200).send();
        }
    }catch(err){
        console.log("Ha habido un problema al eliminar turno")
        console.log(err);
    }
})
exports.seeCreateTurno = (async (req,res,next)=>{
    try{
        const KitList = await Kit.findAll({include: {model: HU, required: true}});
        res.render('users/Profesor/createTurno.ejs',{KitList});
    }catch(err){
        console.log(err);
    }
})
exports.seeTurnFinished = (async (req,res,next)=>{
    const turn = await Turn.findAll({where: {[Op.and]:[{startDate: { [Op.lte]: Date.now() + 2 * 60 * 60 * 1000}}, {[Op.and]: [{isStarted: true},{state: {[Op.eq]: -1}}]}]}});
    res.render('users/Profesor/seePastTurns.ejs',{turn, name: req.user.name});
})
exports.createTurno = (async (req,res,next) =>{
    try{
        const {name, startDate, kitList, teacherName} = req.body;
        if(!kitList || !Array.isArray(kitList)){
            return res.status(400).json({error: "el turno necesita tener un minimo de un kit"});
        }
        if(!name || name == ""){
            return res.status(400).json({error: "el turno necesita tener un nombre"});
        }
        const turno = await Turn.findOne({where: {name:name}});
        if(turno){
            return res.status(400).send("el turno ya existe");
        }
        if(!startDate || startDate <= new Date()){
            return res.status(400).json({error: "se tiene que añadir una fecha valida"});
        }
        let kit;
        let teams = [];
        let k = 1;
        for(let i = 0; i<kitList.length; i++){
            kit = await Kit.findOne({where: {id: kitList[i]}});
            if(!kit){
                    return res.status(400).json({error: `el kit ${kitList[i].name}, no existe`});
                }
            for(let j = 0; j<kit.quantity; j++){
                
                
                teams.push({name: name +'-' + (k),
                            limit: 4,
                            kitId: kit.id,
                            turnId: 0
                });
                k++;
            }
        }
        let code;
        let temp;
        do{
            code =new RandExp(/[A-HJ-NP-Z]{4}-[A-HJ-NP-Z]{4}/).gen();
            temp = await Turn.findOne({where: {codeTurn: code}});
        }while(temp)
        const turn = await Turn.create({name, startDate, userId: req.user.id, codeTurn: code});
        await turn.addKits(kitList);
        teams.forEach(e=>{
            e.turnId = turn.id;
        })
         await Team.bulkCreate(teams);
        return res.status(200).json({
            status: "success",
            message: "Turn creado"});
    }catch(err){
        console.log(err);
        return res.status(500).send();
    }
});
exports.joinTurn = (async (req,res,next) =>{
    const {codeTurn} = req.body;

    const user  = await User.findOne({where: {id: req.user.id}, include: {model: Turn, required: false}});

    var turn = await Turn.findOne({where: {codeTurn: codeTurn}});
    user.hasTurno(turn)
        .then(async exists =>{
            if(!exists){
                user.addTurno(turn);
            }else{
                return res.status(409).send();
            }
        }).catch(err=>{
            if(err){
                console.log(err);
                return res.status(500).send();
            }
        });
    return res.status(200).send();
});

exports.startActivity = async (req,res,next) =>{
    try{
        const turn = await Turn.findOne({where: {id: req.params.idTurn}});
        if(turn.isStarted){
            return res.status(401).send();
        }
        turn.isStarted = true;
        turn.startDate = Date.now();
        turn.state = 0;
        turn.timeLeftState = new Date(turn.startDate.getTime() + 5*60*1000);
        await turn.save();
        socket.startActivityIO(turn.id);
        return res.status(200).send();
    }catch(err){
        console.log(err);
    }
}

