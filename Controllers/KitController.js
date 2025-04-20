const {Kit} = require('../Models/Kit');
const {Teacher} = require('../Models/Teacher');
const {HU} = require('../Models/HistoriaUsuario');
const {LegoBox} = require('../Models/LegoBox');

exports.see = (async (req,res,next)=>{
    try{
        const HUList = await HU.findAll({where: {kitId: null}});
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
    const {name, objetive, teacherName, HUList, nameBox, idProduct} = req.body;
    console.log(req.body);
    //primero comprobamos si existen en la base de datos, si no existen lanzamos error
    try
    {
        if(!objetive || objetive == ""){
            return res.status(400).json({error: "se necesita incluir una necesidad"});
        }
        if(!nameBox || !idProduct){
            return res.status(400).json({error: "se necesita incluir una Caja de Lego"});
        }

        //HUCode son las ids de las historias de usuario
        if(!HUList || !Array.isArray(HUList) || HUList.length===0){
            return res.status(400).json({error: "se necesita incluir mínimo una Historia de Usuario"});
        }
        
        const user = await Teacher.findOne({where: {teacherName : teacherName}});
        if(!user){
            return res.status(401).json({error: "no existe o no tiene los permisos suficentes"});
        }
        const kit = await Kit.create({name, objetive, teacherId: user.id});
        await LegoBox.create({name: nameBox, productId: idProduct, kitId: kit.id});
        
        for(let i = 0; i<HUList.length; i++){
            const y = HUList[i];
            const temp = await HU.findOne({where: {id: y}});
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
        const HU = await HU.create({name,description,imageUrl,kitId});
        return res.status(200).json({status: "success", name: HU.name, description: HU.description, imageUrl: HU.imageUrl});
    }catch(err){
        console.log(err);
    }
});