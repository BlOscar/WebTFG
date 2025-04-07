const {Turno} = require("./../Models/Turno");
const {Kit} = require("./../Models/Kit");
const {Admin} = require("./../Models/Admin");
const {Equipo} = require("./../Models/Equipo");

exports.createTurno = (async (req,res,next) =>{
    try{
        const {name, fechaInicio, kitId, adminCode} = req.body;
        if(!name || name == ""){
            return res.status(400).json({error: "el turno necesita tener un nombre"});
        }
        const turno = Turno.findOne({where: {name:name}});
        if(!turno){
            return res.status(400).json({error: "el turno ya existe"});
        }
        if(!fechaInicio || fechaInicio <= Date.UTC){
            return res.status(400).json({error: "se tiene que añadir una fecha valida"});
        }
        const user = await Admin.findOne({where: {adminCode : adminCode}});
        if(!user){
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        }
        const kit = await Kit.findOne({where: {id: kitId}});
        if(!kit){
            return res.status(400).json({});
        }
        await Turno.create({name, fechaInicio, kitId: kitId, adminId: adminCode});
        return res.status(200).json({success});
    }catch(err){
        return res.status(500);
    }
});