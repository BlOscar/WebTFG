const {User} = require('../Models/User');
const {Team} = require('../Models/Team');
const {Turn} = require('../Models/Turn');
const {TeamRole} = require('../enums/teamRoles');


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
    const team = await Team.findOne({where: {id: req.params.id}, include: {model: User, required: false}});
    const user = await User.findByPk(req.user.id);
    if(req.user.role === 'profesor'){
        res.render('users/showTeam.ejs',{team,existInTeam: false});
    }else{
    const exists = team.users.find(p=> p.id === user.id);
        if(exists){
            res.render('users/showTeam.ejs',{team,existInTeam: true});
        }else{
            res.render('users/showTeam.ejs',{team,existInTeam: false});

        }
    }

}
exports.joinTeam = async (req,res,next) =>{
    try{
    const turn = await Turn.findOne({where: {id: req.params.id}, include: [{model: Team, required: true}, {model: User, require: false}]});
    if(!turn){
        return res.status(401).send();
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
        const team = await Team.findOne({where: {id: req.params.idTeam}, include: {model: User, required: false}});
        if(!team){
            return res.status(404).json({error: "no existe este equipo"});
        }
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
    }catch(err){
        console.log("There was an error during the process: " + err);
        return res.status(500).send();
    }
}