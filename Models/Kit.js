


const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');
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
Kit.belongsTo(User);
User.hasMany(Kit);
(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {Kit, sequelize}; 
