const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {Kit} = require('./Kit');
const {ManualBox} = require('./ManualBox');

const LegoBox = sequelize.define('legoBox',{
    name: {
        type: DataTypes.STRING, require: true

    },
    productCode: {
        type: DataTypes.STRING, require: true
    },
    kitId: {
        type: DataTypes.INTEGER, unique:false
    }
});
/*un kit puede tener una o mas cajas pero una caja solo puede estar en un kit*/
LegoBox.belongsTo(Kit, {foreignKey: 'kitId'});
Kit.hasOne(LegoBox, {foreignKey: 'kitId'});
ManualBox.belongsTo(LegoBox);
LegoBox.hasMany(ManualBox);

(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();
module.exports = {LegoBox,sequelize};