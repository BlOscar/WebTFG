const {User} = require('../Models/User');
const {Teacher} = require('../Models/Teacher');
const {Student} = require('../Models/Student');
const {Turn} = require('../Models/Turn');
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
        //Comprobamos si existe en este contexto
        let temp = await User.findOne({where: {email}});
        if(!temp){
            temp = await User.findOne({where: {username}});
            if(!temp){
                const handlePassword = await bcrypt.hash(password,10);
                const user = await User.create({username,name,email,password: handlePassword, role});
                if(role === 'profesor'){
                    await Teacher.create({teacherName: username,
                        userId: user.id,
                    });
                }else{
                    await Student.create({studentName: username,
                        userId: user.id,
                    });
                }
                console.log(`Usuario creado con email ${email} y username: ${username}`);
                res.redirect('/');
            }else
            {
                console.log("ya existe alguien con ese nickname");
            }
        }else
        {
            console.log("ya existe alguien con ese correo");
        }
    }catch(err){
        next(err);
    }
});
exports.see = (req,res)=>{
    res.render('users/login');
};
exports.newUserForm = (req, res) => {
    res.render('users/register');
};
exports.getMenu = async (req, res) => {
    const turno = await Turn.findAll({where: {startDate: {[Op.gt]: Date.now()}}});
    res.render('users/Profesor/menu', {turno});
};

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
            const token = jwt.sign({email: user.email, userId: user.id}, 'secret', {expiresIn: '2h'});
            res.cookie('token', 'Bearer ' + token, { httpOnly: true });
            res.status(200).json({
                status: "success",
                tokenId:'Bearer ' + token, message: "Login exitoso"});
                //res.redirect("../index");

        
        res.end();
    }
    }catch(err){
        next(err);
    }
});