const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {Admin} = require('./Admin');
//se podria añadir cantidad
const Kit = sequelize.define('kit',
    {
        name: 
        {
            type: DataTypes.STRING, require: true
        },
        necesidades: 
        {
            type:DataTypes.STRING, 
            require: true
        }
    }
);
Kit.belongsTo(Admin);
Admin.hasMany(Kit);
(async()=>{
    try{
        await sequelize.sync({force: true});
        console.log("entro");
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {Kit, sequelize}; 
