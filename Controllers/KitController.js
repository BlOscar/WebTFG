const {Kit} = require('../Models/Kit');
const {Admin} = require('../Models/Admin');
const {HistoriaUsuario} = require('../Models/HistoriaUsuario');
const {CajaLego} = require('../Models/CajaLego');

exports.see = (async (req,res,next)=>{
    try{
        const HUList = await HistoriaUsuario.findAll({where: {kitId: null}});
        res.render('users/Profesor/newKit.ejs',{HUList});
    }catch(err){
        console.log(err);
    }
})
exports.seeHU = (async (req,res,next)=>{
    try{
        const KitList = await Kit.findAll();
        res.render('users/Profesor/addHU.ejs',{KitList});
    }catch(err){
        console.log(err);
    }
})
exports.addKit = (async (req,res,next)=>{
    const {name, necesidades, adminCode, HUList, nameCaja, idProduct} = req.body;
    console.log(req.body);
    //primero comprobamos si existen en la base de datos, si no existen lanzamos error
    try
    {
        if(!necesidades || necesidades == ""){
            return res.status(400).json({error: "se necesita incluir una necesidad"});
        }
        if(!nameCaja || !idProduct){
            return res.status(400).json({error: "se necesita incluir una Caja de Lego"});
        }

        //HUCode son las ids de las historias de usuario
        if(!HUList || !Array.isArray(HUList) || HUList.length===0){
            return res.status(400).json({error: "se necesita incluir mínimo una Historia de Usuario"});
        }
        
        const user = await Admin.findOne({where: {adminCode : adminCode}});
        if(!user){
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        }
        const kit = await Kit.create({name, necesidades, adminId: user.id});
        await CajaLego.create({name: nameCaja, idProduct, kitId: kit.id});
        
        for(let i = 0; i<HUList.length; i++){
            const y = HUList[i];
            const temp = await HistoriaUsuario.findOne({where: {id: y}});
            temp.update({kitId: kit.id});
        }
        return res.status(200).json({status: "success", name: kit.id});
        
    }catch(err){
        console.log(err);
    }
    
    
});

exports.addHU = (async (req,res,next)=>{
    const {name,description,imageUrl, kitId} = req.body;
    try{
        const HU = await HistoriaUsuario.create({name,description,imageUrl,kitId});
        return res.status(200).json({status: "success", name: HU.name, description: HU.description, imageUrl: HU.imageUrl});
    }catch(err){
        console.log(err);
    }
});