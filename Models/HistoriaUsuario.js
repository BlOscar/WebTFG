const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {Kit} = require('./Kit');

const HU = sequelize.define('HU',{
    name: {
        type: DataTypes.STRING, require: true
    },
    description: {
        type: DataTypes.STRING, require: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});
HU.belongsTo(Kit);
Kit.hasMany(HU);

(async()=>{
    try{
        await sequelize.sync({alter: true});
        
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {HU, sequelize}; 
