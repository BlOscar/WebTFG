/*DATOS A CONSIDERAR
    name: que seran a estilo de: IWM41- Team 1, o sino simplemente Team 1
    Burdown chart: sera una imagen subida a la bd 
    Límite de integrantes: 

    Un alumno estara asociado a un equipo y un equipo tiene uno o mas alumnos
(puede que panteé fijarlo con la hora y comprobar si ese alumno está en ese turno, evitando que
haya un alumno en dos turnos consecutivos y a la misma hora)
    Un equipo tiene uno o mas Sprints y un Sprint esta asociado a un equipo, si el equipo se elimina
tambien los sprints
    un profesor podrá crear uno o mas equipos y un equipo sera creado por un profesor.
Además, un profesor será uno o mas clientes de un equipo y un equipo tendrá uno o mas clientes

*/
const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');
const {Kit} = require('./Kit');
const {Turn} = require('./Turn');
const {HU} = require('./HistoriaUsuario');



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
            values: ['sm','po', 'dev'],
            allowNull: false,
            defaultValue: 'dev'
    },
});
User.belongsToMany(Team, {through: TeamStudent});
Team.belongsToMany(User, {through: TeamStudent});

Team.belongsTo(User);
User.hasMany(Team);

Team.belongsTo(Turn, {foreignKey: 'turnId'});
Turn.hasMany(Team, {foreignKey: 'turnId'});

Team.belongsTo(Kit, {foreignKey: 'kitId'});
Kit.hasMany(Team, {foreignKey: 'kitId'});


HU.belongsToMany(Team, {through: 'TeamHU', foreignKey: 'HUId'});
Team.belongsToMany(HU, {through: 'TeamHU', foreignKey: 'teamId'});

(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {Team, sequelize}; 
