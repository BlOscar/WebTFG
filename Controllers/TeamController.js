const {Kit} = require('../Models/Kit');
const {User} = require('../Models/User');
const {HU} = require('../Models/HistoriaUsuario');
const {LegoBox} = require('../Models/LegoBox');
const fs = require('fs');
const { ManualBox } = require('../Models/ManualBox');
const {Team} = require('../Models/Team');
const {Turn} = require('../Models/Turn');
const {TeamRole} = require('../enums/teamRoles');


exports.joinTeam = async (req,res,next) =>{
    const turn = await Turn.findOne({where: {id: req.params.id}, include: {model: Team, required: true}});
    const team = await Team.findOne({where: {id: req.params.idTeam}, include: {model: User, required: false}});
    const students = await team.getUsers();

    if(students.length === team.limit){
        return res.status(401).send();
    }
    const user = await User.findByPk(req.user.id);
    const roles = [];
    turn.hasTeam(team)
        .then(async exists =>{
            if(exists){
                const temp = await team.hasUser(user);
                if(temp){
                    return res.status(409).send();
                }
                else{
                    let roleSelection = [];
                    roleSelection.push(TeamRole.ScrumMaster,TeamRole.ProductOwner,TeamRole.Developer);
                    students.forEach(student=>{
                        if(student.TeamStudent.role === TeamRole.ScrumMaster){
                            roleSelection = roleSelection.filter(x=> x !== TeamRole.ScrumMaster);
                        }else if(student.TeamStudent.role === TeamRole.ProductOwner){
                            roleSelection = roleSelection.filter(x=> x !== TeamRole.ProductOwner);                        
                        }
                        Math.random(3);

                    })
                    await team.addUser(user, {through: {role: roleSelection[Math.floor(Math.random() * roleSelection.length)]}});
                }
            }else{

            }
        }).catch(err=>{
            console.log(err);
        });
}
exports.removeTeam = async (req,res,next)=>{
    const team = await Team.findOne({where: {id: req.params.idTeam}, include: {model: User, required: false}});
    const students = await team.getUsers();
    const user = await User.findByPk(req.user.id);
    if(students.length === team.limit){
        return res.status(401).send();
    }

    const exists = await team.hasUser(user);
        if(exists){
            team.removeUser(user);
        }
        else{
            return res.status(404).send();
        }
}