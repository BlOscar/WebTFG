const {User} = require('../Models/User');
const {Turn} = require('../Models/Turn');
const {Team} = require('../Models/Team');

const {Sprint} = require('../Models/Sprint');
const {Result} = require('../Models/Result');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const { Op } = require('sequelize');



exports.register = (async (req,res,next) =>{
    try{
        const {username, name, email, password, role} = req.body;
        let temp = await User.findOne({where: {email}});
        if(!temp){
            temp = await User.findOne({where: {username}});
            if(!temp){
                if(!password || !username){
                    return res.status(400).json({error: "debes de tener un usuario y contraseña"});
                }
                const handlePassword = await bcrypt.hash(password,10);
                const user = await User.create({username,name,email,password: handlePassword, role});
                console.log(`Usuario creado con email ${email} y username: ${username}`);
                return res.status(200).json({'success': 'patata'})
            }else
            {
                console.log("Se ha intentado crear un usuario con un username existente");
                return res.status(409).send("ya existe alguien con ese nickname");
            }
        }else
        {
            res.status(409).json({error: "ya existe alguien con ese correo"});
        }
    }catch(err){
        console.log("Ha habido un problema en la creacion de un usuario");
        console.log(err);
        return res.status(500).send();
    }
});
exports.see = (req,res)=>{
    res.render('users/login');
};
exports.newUserForm = (req, res) => {
    res.render('users/register');
};
exports.getMenu = async (req, res) => {
    if(req.user.role === 'alumno'){
        await MenuStudent(req,res);
    }else{
        await MenuTeacher(req,res);
    }
};

async function MenuTeacher(req,res){
    const turno = await Turn.findAll({where: {[Op.or]:[{startDate: { [Op.gt]: Date.now() + 2 * 60 * 60 * 1000}}, {[Op.and]: [{isStarted: true},{state: {[Op.ne]: -1}}]}]}});
    res.render('users/Profesor/menu', {turno, name: req.user.name});
}

async function MenuStudent(req,res) {
    const turno = await Turn.findAll(   {where: {[Op.or]:[{startDate: { [Op.gt]: Date.now() + 2 * 60 * 60 * 1000}}, {[Op.and]: [{isStarted: true},{state: {[Op.ne]: -1}}]}]},
                                        include: [  {model: User, where: {id: req.user.id},required: true},
                                                    {model: Team, include: 
                                                        {model: User,where: {id: req.user.id}, require: false},
                                                    require: false}]});
        
    const turnoList = []
    turno.forEach(t=>{
        let exists = false;
        if(t.teams.length !== 0){
            exists = true;
        }
        turnoList.push([exists, t]);
    })
    
    res.render('users/Student/menu', {turnoList, user: req.user});
}

    

exports.login = (async (req,res,next) =>{
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);
    try{
        const user = await User.findOne({where: {email}});
    if(!user){
        return res.status(404).json({error: "user not found"});
    }else{
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({error: "unauthorized"});
        }
        const isTeacher = user.role === "profesor";
            const token = jwt.sign({email: user.email, id: user.id}, process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES});
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 24*60*60*1000
              });
            res.status(200).json({
                status: "success",
                tokenId: token, 
                isTeacher: isTeacher,
                role: user.role,
                id: user.id,
                message: "Login exitoso"});
        res.end();
    }
    }catch(err){
        console.log("Ha habido un problema en el inicio de sesion de un usuario");
        console.log(err);
        return res.status(500).send();
    }
});

exports.logout = ((req,res,next)=>{
    req.cookies.token = "";
    res.render('users/login');
});