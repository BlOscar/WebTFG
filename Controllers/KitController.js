const {Kit} = require('../Models/Kit');
const {User} = require('../Models/User');
const {HU} = require('../Models/HistoriaUsuario');
const {LegoBox} = require('../Models/LegoBox');
const fs = require('fs');
const { ManualBox } = require('../Models/ManualBox');
const { col, fn } = require('sequelize');

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
exports.seeKits = (async (req,res,next)=>{
    try{
        const kitList = await Kit.findAll();
        const huList = await HU.findAll({attributes: ['id', 'kitId']});
        const boxList = await LegoBox.findAll({attributes: ['id', 'kitId']});
        res.render('users/Profesor/showKits.ejs', {kitList, huList, boxList});
    }catch(err){
        console.log(err);
    }
})
exports.seeKit = (async (req,res,next)=>{
    const kitId = req.params.id;
    try{
        const kit = await Kit.findOne({where: {id: kitId}});
        if(!kit){
            return res.status(404).json({error: "este kit no existe"});
        }
        const HUList = await HU.findAll({where: {kitId: kitId}});
        const boxLego = await LegoBox.findAll({where: {kitId: kitId}, include: {model:ManualBox, required: false}});
                const manuals = [];

        boxLego.forEach(e=>{
            manuals.push(e.manualBoxes);
        })
        console.log(""+boxLego.manualBoxes);
        
            res.render('users/Profesor/menuKit.ejs', {kit, HUList, boxLego, manuals});
        
    }catch(err){
        console.log(err);
    }
})
exports.addKit = (async (req,res,next)=>{
    const {name, objetive, quantity} = req.body;
    //primero comprobamos si existen en la base de datos, si no existen lanzamos error
    try
    {
        if(!objetive || objetive == ""){
            return res.status(400).json({error: "se necesita incluir una necesidad"});
        }
        const kit = await Kit.create({name, objetive, userId: req.user.id, quantity});
        return res.status(200).json({status: "success", name: kit.id});
    }catch(err){
        console.log(err);
    }
    
    
});

exports.addHU = (async (req,res,next)=>{
    const {name,description, kitId} = req.body;
    const imageUrl = req.file;
    HU.findOrCreate({where: {name: name, kitId:kitId},
                    defaults: {name,description,imageUrl : imageUrl.path,kitId}}
        ).then(([hu,isCreated])=>{
            if(isCreated){
                return res.status(200).json({status: "success", name: hu.name, description: hu.description, imageUrl: hu.imageUrl});
            }
            const error = new Error('Esta HU ya existe en este contexto');
            error.statusCode = 409; //Conflicto
            throw error;
            
        }).catch(err=>{
            console.log(err);
            fs.unlink(imageUrl.path, error=>{
            if(error) 
                console.log('error al eliminar', error)
            });
            return res.status(err.statusCode || 500).send();

        });
});

exports.seeBox = (async (req,res,next)=>{
    try{
        const KitList = await Kit.findAll();
        res.render('users/Profesor/addBox.ejs',{KitList});
    }catch(err){
        console.log(err);
    }
});

exports.addBox = (async (req,res,next)=>{
    const {name, productId, kitId} = req.body;
    const manualUrl = req.files;
    LegoBox.findOrCreate({
        where: {name: name, productCode : productId, kitId: kitId},
        defaults: {name, productCode: productId, kitId}
    }).then(async ([box, isCreated])=>{
        if(isCreated){
            for(let i = 0; i< manualUrl.length; i++){
                await ManualBox.create({name: `${name}-${i}`, urlPDF: manualUrl[i].path, legoBoxId: box.id});
            };
            return res.status(200).json({status: "success"});
        }
        const error = new Error('Esta caja de Lego ya existe');
        error.statusCode = 409; //Conflicto
        throw error;
    }).catch(err=>{
        console.log(err);
        manualUrl.forEach(element => {
            fs.unlink(element.path, error=>{
                if(error) console.log('error al eliminar', error);
            });
        });
        return res.status(err.statusCode || 500).send();
    })
});