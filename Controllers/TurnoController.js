const {Turno} = require("./../Models/Turno");
const {Kit} = require("./../Models/Kit");
const {Admin} = require("./../Models/Admin");
const {Equipo} = require("./../Models/Equipo");

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
        const {name, fechaInicio, kitList, adminCode} = req.body;
        if(!name || name == ""){
            return res.status(400).json({error: "el turno necesita tener un nombre"});
        }
        const turno = Turno.findOne({where: {name:name}});
        if(!turno){
            return res.status(400).json({error: "el turno ya existe"});
        }
        if(!fechaInicio || fechaInicio <= new Date()){
            return res.status(400).json({error: "se tiene que añadir una fecha valida"});
        }
        const user = await Admin.findOne({where: {adminCode : adminCode}});
        if(!user){
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        }
        const kit = await Kit.findOne({where: {id: kitList}});
        if(!kit){
            return res.status(400).json({});
        }
        const turn = await Turno.create({name, fechaInicio, adminId: user.id});
        await turn.addKits(kitList);
        return res.status(200).json({
            status: "success",
            message: "Turno creado"});
    }catch(err){
        return res.status(500);
    }
});