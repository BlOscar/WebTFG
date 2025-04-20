const {Turn} = require("../Models/Turn");
const {Kit} = require("./../Models/Kit");
const {Teacher} = require("../Models/Teacher");
const {Team} = require("../Models/Team");
const { Op } = require('sequelize');

exports.seeCreateTurno = (async (req,res,next)=>{
    try{
        const KitList = await Kit.findAll();
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
        const user = await Teacher.findOne({where: {teacherName : teacherName}});
        if(!user){
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        }
        let kit;
        var teams = [];
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
        const turn = await Turn.create({name, startDate, adminId: user.id});
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