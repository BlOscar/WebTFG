


const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {Teacher} = require('./Teacher');
//se podria añadir cantidad
const Kit = sequelize.define('kit',
    {
        name: 
        {
            type: DataTypes.STRING, require: true
        },
        //esto seria un documento pdf
        objetive: 
        {
            type:DataTypes.STRING, 
            require: true
        },
        quantity: {
            type:DataTypes.INTEGER,
            require: true,
            defaultValue: 1
        }
    }
);
Kit.belongsTo(Teacher);
Teacher.hasMany(Kit);
(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {Kit, sequelize}; 
