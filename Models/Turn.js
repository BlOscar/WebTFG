//turno que tendrá
/*
id asociado: el que nos dara la db
    nombre del turno: que podria ser turno de mañana IWM41
    fecha de inicio: para cuando asignemos kits no haya conflictos temporales, es decir,
un kit no puede estar en dos lugares a la vez, la duracion se establecerá con 2 horas para cada turno

    un turno tendra uno o mas alumnos y un alumno tendrá 
uno o mas turnos, debido a que un alumno puede puede hacer la actividad varias veces

    un turno solamente tendrá un profesor pero un profesor puede hacer uno o mas turnos
    un turno puede tener asociado uno o mas kits y un kit puede tener uno o mas turnos, si no hay conflicto
    un turno tendra uno o mas equipos y un equipo tendra un solo turno, el numero de equipos que haya no puede superar el numero de kits
    
*/
const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');
const {Kit} = require('./Kit');
//se podria añadir cantidad
const Turn = sequelize.define('turno',
    {
        name: 
        {
            type: DataTypes.STRING, require: true
        },
        //esto seria un documento pdf
        startDate: 
        {
            type:DataTypes.DATE, 
            require: true
        },
        codeTurn:{
            type: DataTypes.STRING, require: true, defaultValue: 'default'

        },
        isStarted: {
            type: DataTypes.BOOLEAN, defaultValue: false
        },
        state: {
            type: DataTypes.INTEGER, require: true, defaultValue: 0
        }
    }
);
const TurnKit = sequelize.define('TurnKit',{
    quantity:{
        type: DataTypes.INTEGER, require: true

    }
}
    
)

Turn.belongsToMany(User, {through: 'TurnStudent'});
User.belongsToMany(Turn, {through: 'TurnStudent'});

Turn.belongsTo(User);
User.hasMany(Turn);

Turn.belongsToMany(Kit, {through: TurnKit});
Kit.belongsToMany(Turn, {through: TurnKit});
(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {Turn, sequelize}; 
