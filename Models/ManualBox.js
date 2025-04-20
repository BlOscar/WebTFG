const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });

const ManualBox = sequelize.define('manualBox',{
    name: {
        type: DataTypes.STRING, require: true

    },
    urlPDF: {
        type: DataTypes.STRING, require: true
    }
});



(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();

module.exports = {ManualBox,sequelize};