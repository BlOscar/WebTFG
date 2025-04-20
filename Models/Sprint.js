const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {HU} = require('./HistoriaUsuario');
const {Team} = require('./Team');

const Sprint = sequelize.define('sprint',{
    name: {
        type: DataTypes.STRING, require: true

    },
    objetive: {
        type: DataTypes.STRING, require: true
    },
    improvement: {
        type: DataTypes.INTEGER, unique: true
    }
});

HU.belongsToMany(Sprint, {through: 'SprintHU', foreignKey: 'huId'});
Sprint.belongsToMany(HU,{through: 'SprintHU', foreignKey: 'sprintId'});

Team.belongsToMany(Sprint, {through: 'TeamSprint', foreignKey: 'teamId'});
Sprint.belongsToMany(Team,{through: 'TeamSprint', foreignKey: 'sprintId'});

(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();

module.exports = {Sprint,sequelize};