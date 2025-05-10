const {Turn} = require("../Models/Turn");
const {Kit} = require("./../Models/Kit");
const {User} = require("../Models/User");


const {Team} = require("../Models/Team");
const { Op } = require('sequelize');
const { HU } = require("../Models/HistoriaUsuario");


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
            }
        }
        const teams = await Team.findAll({include: {
            model: Turn,
            where: {id: idTurn}
        }});
        const students = await User.findAll({include:{
            model: Turn,
            where: {id: idTurn}
        }});
        
        if(Number.isNaN(idTurn)) 
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        const turn = await Turn.findOne({where: {id: idTurn}});
        if(!turn)
            return res.status(404).send();
        res.render('users/Profesor/menuTurno.ejs', {turn, kitsAdded, teams, students});

    }catch(err){
        console.log(err);
    }
})
exports.modifyTurno = (async (req,res,next) =>{
    const {idTurn, fechaInicio, kitToDelete, kitToAdd} = req.body;
    if(Number.isNaN(idTurn)) 
        return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
    const turn = await Turn.findOne({where: {id: idTurn}});
    if(!turn)
        return res.status(404).send();
    if(!fechaInicio || fechaInicio <= new Date()){
        return res.status(400).json({error: "se tiene que añadir una fecha valida"});
    }
    turn.update({fechaInicio: fechaInicio});
    const kits = await Turn.findAll({where: {id: idTurn}, include : Kit});
    if(checkKits(kits, kitToDelete, false)){
        turn.removeKits(kitToDelete);
    }
    if(checkKits(kits,kitToAdd, true)){
        turn.addKits(kitToAdd);
    }

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

exports.seeCreateTurno = (async (req,res,next)=>{
    try{
        const KitList = await Kit.findAll({include: {model: HU, required: true}});
        res.render('users/Profesor/createTurno.ejs',{KitList});
    }catch(err){
        console.log(err);
    }
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
        const user = await User.findOne({where: {username : teacherName}});
        if(!user){
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        }
        let kit;
        let teams = [];
        for(let i = 0; i<kitList.length; i++){
            kit = await Kit.findOne({where: {id: kitList[i]}});
            if(!kit){
                return res.status(400).json({error: `el kit ${kitList[i].name}, no existe`});
            }
            teams.push({name: name +'-' + i,
                        limit: 4,
                        kitId: kit.id,
                        turnId: 0
            });

        }
        const turn = await Turn.create({name, startDate, userId: user.id});
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