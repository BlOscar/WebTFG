const {User} = require('../Models/User');
const {Team, TeamStudent} = require('../Models/Team');
const {Turn} = require('../Models/Turn');
const {TeamRole} = require('../enums/teamRoles');
const { Sprint } = require('../Models/Sprint');
const { Result } = require('../Models/Result');
const { HU } = require('../Models/HistoriaUsuario');
const { Kit } = require('../Models/Kit');


exports.getTeams = async (req,res,next) =>{
    try{
        const turn = await Turn.findOne({where: {id: req.params.id}, include: [{model: Team, required: true, include: {model: User, required: false}}]});
        if(!turn){
            return res.status(401).send();
        }
        const teams = await turn.getTeams();
        

        if(!teams){
            return res.status(401).send();
        }
        const user = await User.findOne({where: {id: req.user.id}});
        
        var teamList = [];
        var temp; 
        for(let i = 0; i<teams.length; i++){
            const exists = await teams[i].hasUser(user);

            if(exists){
                //arreglar status
            return res.status(401).send();
            }
            temp = await teams[i].countUsers();
                teamList.push([temp,teams[i]]);

            
        }
        const TurnId = req.params.id;
            res.render('users/Student/TeamList.ejs', {teamList, TurnId});
        
    }catch(err){
        console.log(err);
    }
}
exports.showTeam = async(req,res,next) =>{
    const team = await Team.findOne({where: {id: req.params.id}, include: [{model: User, required: false}, {model: Sprint, required: false, include: {
                                            model: Result, required: true, include:{
                                                model: HU, required: true
                                                }
                                            }
                                        }, {model: Kit, required:true}]});
    const user = await User.findByPk(req.user.id);
    if(req.user.role === 'profesor'){
        res.render('users/showTeam.ejs',{team,existInTeam: false, isTeacher: true});
    }else{
    const exists = team.users.find(p=> p.id === user.id);
        if(exists){
            res.render('users/showTeam.ejs',{team,existInTeam: true, isTeacher: false});
        }else{
            res.render('users/showTeam.ejs',{team,existInTeam: false, isTeacher: false});

        }
    }

}
exports.joinTeam = async (req,res,next) =>{
    try{
    const turn = await Turn.findOne({where: {id: req.params.id}, include: [{model: Team, required: true, include: {model:User, required: false}}, {model: User, require: false}]});
    if(!turn){
        return res.status(401).send();
    }
    let isTrue = true;
    turn.teams.forEach(t=>{
        if(t.users){
            const temp = t.users.find(p=> p.id === req.user.id);
            if(temp){
                isTrue = false;
            }
        }
    })
    if(!isTrue){
        return res.status(409).send();
    }
    const team = await Team.findOne({where: {id: req.params.idTeam}, include: {model: User, required: false}});
    if(!team){
        return res.status(401).send();
    }
    const students = await team.getUsers();

    if(students.length === team.limit){
        return res.status(401).send();
    }
    const user = await User.findByPk(req.user.id);
    turn.hasUser(user).then(exists=>{
        if(!exists){
            return res.status(401).send();
        }
    });
    const roles = [];
    turn.hasTeam(team)
        .then(async exists =>{
            if(exists){
                let temp = await team.hasUser(user);
                if(temp){
                    return res.status(409).send();
                }

                    let roleSelection = [];
                    roleSelection.push(TeamRole.ScrumMaster,TeamRole.ProductOwner,TeamRole.Developer);
                    
                    students.forEach(student=>{
                        if(student.TeamStudent.role === TeamRole.ScrumMaster){
                            roleSelection = roleSelection.filter(x=> x !== TeamRole.ScrumMaster);
                        }else if(student.TeamStudent.role === TeamRole.ProductOwner){
                            roleSelection = roleSelection.filter(x=> x !== TeamRole.ProductOwner);                        
                        }
                    })
                    if((students.length === team.limit-2 && roleSelection.length===3) ||
                        (students.length === team.limit-1 && roleSelection.length===2)){
                        roleSelection = roleSelection.filter(x=> x !== TeamRole.Developer);                        
                    }
                    await team.addUser(user, {through: {role: roleSelection[Math.floor(Math.random() * roleSelection.length)]}});
                    return res.status(200).send();
            }else{
                return res.status(409).send();
            }
        }).catch(err=>{
            console.log(err);
        });
    }catch(err){
        console.log("There was an error during the process: " + err);
        return res.status(500).send();
    }
}
exports.removeTeam = async (req,res,next)=>{
    try{
        const {userid} = req.body;
        const team = await Team.findOne({include: [{model: Turn, where: {id: req.params.id},required: true}, {model: User, required: false}]});
        if(!team){
            return res.status(404).json({error: "no existe este equipo"});
        }
        
        const user = await User.findByPk(userid);
        const exists = await team.hasUser(user);
        if(exists){
            await team.removeUser(user);
            await next();
        }
        else{
            return res.status(404).send();
        }
    }catch(err){
        console.log("There was an error during the process: " + err);
        return res.status(500).send();
    }
}
exports.leaveTeam = async (req,res,next)=>{
    try{
        const team = await Team.findOne({where: {id: req.params.id},include: [{model: User, required: false}]});
        if(!team){
            return res.status(404).json({error: "no existe este equipo"});
        }
        
        const user = await User.findByPk(req.user.id);
        const exists = await team.hasUser(user);
        if(exists){
            await team.removeUser(user);
            return res.status(200).send();
        }
        else{
            return res.status(404).send();
        }
    }catch(err){
        console.log("There was an error during the process: " + err);
        return res.status(500).send();
    }
}
exports.verifyTeams = async (req,res,next)=>{
    try{
        const turn = await Turn.findOne({where: {id: req.params.idTurn}, include: {model: Team, required: true, include: {model: User, through: {attributes: ['teamId','userId','role']}}}});
        if(!turn){
            return res.status(404).send();
        }
        const teams = turn.teams;
        let canStart = false;
        teams.forEach(async team =>{
            let existSM = false;
            let existPO = false;
            let existDev = false;
            if(team.users.length >= 3){
                canStart = true;
                team.users.forEach(user=>{
                    const role = user.TeamStudent.role;
                    if(role === TeamRole.Developer){
                        existDev = true;
                    }else if(role === TeamRole.ProductOwner){
                        existPO = true;
                    }else{
                        existSM = true;
                    }
                })
                
                if(!existSM){
                    const devUser = team.users.find(u => u.TeamStudent.role === TeamRole.Developer);
                    if (devUser) {
                        devUser.TeamStudent.role = TeamRole.ScrumMaster;
                        await devUser.TeamStudent.save();
                    }
                }
                if(!existPO){
                    const devUser = team.users.find(u => u.TeamStudent.role === TeamRole.Developer);
                    if (devUser) {
                        devUser.TeamStudent.role = TeamRole.ProductOwner;
                        await devUser.TeamStudent.save();
                    }
                }
            }
        })
        if(canStart){
            next();
        }else{
            return res.status(400).send();
        }

    }catch(err){
        console.log(err);
    }
}