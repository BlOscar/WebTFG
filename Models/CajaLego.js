const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {Kit} = require('./Kit');

const CajaLego = sequelize.define('cajaLego',{
    name: {
        type: DataTypes.STRING, require: true

    },
    idProduct: {
        type: DataTypes.STRING, require: true
    },
    kitId: {
        type: DataTypes.INTEGER, unique: true
    }
});
/*un kit puede tener una o mas cajas pero una caja solo puede estar en un kit*/
CajaLego.belongsTo(Kit, {foreignKey: 'kitId'});
Kit.hasOne(CajaLego, {foreignKey: 'kitId'});

(async()=>{
    try{
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();

module.exports = {CajaLego,sequelize};