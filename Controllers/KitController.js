const {Kit} = require('../Models/Kit');
const {User} = require('../Models/User');
const {HU} = require('../Models/HistoriaUsuario');
const {LegoBox} = require('../Models/LegoBox');
const fs = require('fs');
const { ManualBox } = require('../Models/ManualBox');
const { col, fn } = require('sequelize');
const { Turn } = require('../Models/Turn');

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
        const kit = await Kit.findOne({where: {id: kitId}, include: {model: Turn, required: false}});
        if(!kit){
            return res.status(404).json({error: "este kit no existe"});
        }
        const HUList = await HU.findAll({where: {kitId: kitId}});
        const boxLego = await LegoBox.findAll({where: {kitId: kitId}, include: {model:ManualBox, required: false}});
                const manuals = [];

        boxLego.forEach(e=>{
            manuals.push(e.manualBoxes);
        })
        let canEliminate = true;
        if(kit.turnos.length !== 0){
            canEliminate = false;
        }
            res.render('users/Profesor/menuKit.ejs', {kit, HUList, boxLego, manuals, canEliminate});
        
    }catch(err){
        console.log(err);
    }
})
exports.addKit = (async (req,res,next)=>{
    const {name, quantity} = req.body;
    const objetive = req.file;
    //primero comprobamos si existen en la base de datos, si no existen lanzamos error
    try
    {
        const temp = await Kit.findOne({where: {name: name}});
        if(temp){
            return res.status(409).json({error: "este nombre ya se usa en otro kit"});
        }
        if(!objetive || objetive == ""){
            return res.status(400).json({error: "se necesita incluir una necesidad"});
        }
        if(quantity <= 0){
            return res.status(400).json({error: "se necesita tener minimo un kit"});
        }
        const kit = await Kit.create({name, objetive: objetive.path, userId: req.user.id, quantity});
        return res.status(200).json({status: "success", name: kit.id});
    }catch(err){
        console.log(err);
        fs.unlink(objetive.path, error=>{
            if(error) 
                console.log('error al eliminar', error)
            });
            return res.status(err.statusCode || 500).send();
    }
    
    
});

exports.removeKit = (async (req,res,next)=>{
    try{

    const {idKit} = req.body;
    const turn = await Turn.findOne({include: {model: Kit, where: {id: idKit},required: true}})
    if(turn){
        return res.status(409).send("No se puede eliminar si esta en un turno");
    }
    const kit = await Kit.findOne({where: {id: idKit}, include: [{model: HU, required: false}, {model: LegoBox, required: false, include: {model: ManualBox, required: true}}]});

    if(!kit){
        return res.status(404).send("No se ha encontrado el kit");
    }
    if(kit.legoBoxes.length !==0){
        kit.legoBoxes.forEach(async box=>{
        const manuals = box.manualBoxes;
        manuals.forEach(async manual=>{
            fs.unlink(manual.urlPDF,async error=>{
                if(error){
                    console.log('error al eliminar', error);
                    const responseError = new Error('No se ha podido eliminar');
                    responseError.status = 401;
                    throw responseError;
                }
            });
                await manual.destroy();
        });
                            
            await box.destroy();

        })
                    

    }
    if(kit.HUs.length !==0){
        kit.HUs.forEach(async hu=>{
        fs.unlink(hu.imageUrl,async error=>{
            if(error){
                console.log('error al eliminar', error);
                const responseError = new Error('No se ha podido eliminar');
                responseError.status = 401;
                throw responseError;
            }
            });
            await hu.destroy();
        });
    }
    await kit.removeHUs();
    await kit.removeLegoBoxes();
    

    await kit.destroy();
    return res.status(200).send();
    }catch(err){
        console.log(err);
        return res.status(err.statusCode || 500).send();
    }
})
exports.removeHU = (async (req,res,next)=>{
    try{
    const {idHU} = req.body;
    const hu = await HU.findOne({where: {id: idHU}});
    if(!hu){
        return res.status(404).send();
    }
    fs.unlink(hu.imageUrl.path,async error=>{
            if(error){
                console.log('error al eliminar', error);
                const responseError = new Error('No se ha podido eliminar');
                responseError.status = 401;
                throw responseError;
            }
            else await hu.destroy();
            });
    return res.status(200).send();
    }catch(err){
        console.log(err);
        return res.status(err.statusCode || 500).send();
    }
    
});

exports.removeBox = (async (req,res,next)=>{
    const {idBox} = req.body;
    const box = await LegoBox.findOne({where: {id: idBox}, include: {model: ManualBox, required: true}});
    if(!box){
        return res.status(404).send();
    }
    try{
    const manuals = box.getManuals();
    manuals.forEach(manual=>{
        fs.unlink(manual.manualUrl.path,async error=>{
            if(error){
                console.log('error al eliminar', error);
                const responseError = new Error('No se ha podido eliminar');
                responseError.status = 401;
                throw responseError;
            }
            });
    });
    await manuals.destroy();
    await box.destroy();
    }catch(err){
        console.log(err);
        return res.status(err.statusCode || 500).send();
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
    if(!name || name.trim() === ""){
        return res.status(400).json({error: "Se debe de escribir un nombre para la caja"});
    }
    const manualUrl = req.files;
    if(manualUrl.length === 0){
        return res.status(400).json({error: "Se debe de incluir un pdf con instrucciones"});

    }
    LegoBox.findOrCreate({
        where: {name: name, productCode : productId, kitId: kitId},
        defaults: {name, productCode: productId, kitId}
    }).then(async ([box, isCreated])=>{
        if(isCreated){
            for(let i = 0; i< manualUrl.length; i++){
                await ManualBox.create({name: `${name}-${i+1}`, urlPDF: manualUrl[i].path, legoBoxId: box.id});
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
        return res.status(err.statusCode || 500).json({error: "ha habido un problema con la creacion de la caja"});
    })
});