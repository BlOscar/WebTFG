const {Kit} = require('../Models/Kit');
const {Admin} = require('../Models/Admin');
const {HistoriaUsuario} = require('../Models/HistoriaUsuario');
const {Caja} = require('../Models/CajaLego');

exports.see = (async (req,res,next)=>{
    res.render('/users/Profesor/kit.new.ejs');
})
exports.addKit = (async (req,res,next)=>{
    const {necesidades, adminCode, HUCode, CajaCode} = req.body;
    //primero comprobamos si existen en la base de datos, si no existen lanzamos error
    try
    {
        if(!necesidades || necesidades == ""){
            return res.status(400).json({error: "se necesita incluir una necesidad"});
        }

        const temp = [];
        
        if(!HUCode || !Array.isArray(HUCode) || HUCode.length===0){
            return res.status(400).json({error: "se necesita incluir mínimo una Historia de Usuario"});
        }
        if(!CajaCode){
            return res.status(400).json({error: "se necesita incluir una caja"});
        }
        const user = await Admin.findOne({where: adminCode});
        if(!user){
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        }
        const kit = await Kit.create({necesidades, userId: user.id});
        HUCode.foreach(async element =>{
            temp.push = await HistoriaUsuario.findOne({where: element});
            if(!temp){
                await HistoriaUsuario.create({name: temp.name, description: temp.description, imageUrl: "patata", kitId: kit.id});
            }
        });
        //const CajaCode = await Caja.findOne({where: CajaCode});

        
    }catch(err){
        console.log(err);
    }
    
    
});

exports.addHU = (async (req,res,next)=>{
    const {name,description,imageUrl} = req.body;
    try{
        const HU = await HistoriaUsuario.create({name,description,imageUrl});
        return res.status(200).json({status: "success", name: HU.name, description: HU.description, imageUrl: HU.imageUrl});
    }catch(err){
        console.log(err);
    }
});