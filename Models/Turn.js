
const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');
const {Kit} = require('./Kit');
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
        },
        timeLeftState: {
            type: DataTypes.DATE
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
