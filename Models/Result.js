const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {Sprint} = require('./Sprint');
const {HU} = require('./HistoriaUsuario');
const Result = sequelize.define('result',{
    SMValidation: {
        type: DataTypes.BOOLEAN, defaultValue: false
    },
    ClientValidation: {
        type: DataTypes.BOOLEAN, defaultValue: false
    },
    urlimage: {
        type: DataTypes.STRING, require: true
    },
    burdownChart: {
        type: DataTypes.STRING, require: true

    }
});

Result.belongsTo(HU);
HU.hasMany(Result);

Result.belongsTo(Sprint);
Sprint.hasMany(Result);
(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();

module.exports = {Result,sequelize};