
const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');
const {Kit} = require('./Kit');
const {Turn} = require('./Turn');
const {HU} = require('./HistoriaUsuario');
const {TeamRole} = require('../enums/teamRoles');



const Team = sequelize.define('team',{
    name: {
        type: DataTypes.STRING, require: true

    },
    chart:{
        type: DataTypes.STRING, require: true
    },
    limit:{
        type: DataTypes.INTEGER, require: true
    },
    turnId: {
        type: DataTypes.STRING, require: true
    },
    kitId: {
        type: DataTypes.INTEGER
    },

});
const TeamStudent = sequelize.define('TeamStudent',{
    role: {
        type: DataTypes.ENUM,
            values: [TeamRole.ScrumMaster,TeamRole.ProductOwner, TeamRole.Developer],
            allowNull: false,
            defaultValue: TeamRole.Developer
    },
});
const TeamHU = sequelize.define('TeamHU',{
    priority: {
        type: DataTypes.CHAR, 
        require: true, 
        

    },
    size: {
        type: DataTypes.INTEGER, 
        require: true, 
        validate: {
            isInt: true,
            min: {args: [0], msg: "the size must be greater than 0"}
        },
        defaultValue: 0
    },
})
User.belongsToMany(Team, {through: TeamStudent});
Team.belongsToMany(User, {through: TeamStudent});

Team.belongsTo(User);
User.hasMany(Team);

Team.belongsTo(Turn, {foreignKey: 'turnId'});
Turn.hasMany(Team, {foreignKey: 'turnId'});

Team.belongsTo(Kit, {foreignKey: 'kitId'});
Kit.hasMany(Team, {foreignKey: 'kitId'});


HU.belongsToMany(Team, {through: TeamHU, foreignKey: 'HUId'});
Team.belongsToMany(HU, {through: TeamHU, foreignKey: 'teamId'});

(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {Team,TeamStudent, sequelize}; 
