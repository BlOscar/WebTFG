const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {Kit} = require('./Kit');

const HistoriaUsuario = sequelize.define('HU',{
    name: {
        type: DataTypes.STRING, require: true
    },
    description: {
        type: DataTypes.STRING, require: true
    },
    prioridad: {
        type: DataTypes.INTEGER, 
        require: true, 
        validate: {
            isInt: true,
            min: {args: [0], msg: "la prioridad tiene que ser mayor que 0"}
        },
        defaultValue: 0

    },
    tamanno: {
        type: DataTypes.INTEGER, 
        require: true, 
        validate: {
            isInt: true,
            min: {args: [0], msg: "la prioridad tiene que ser mayor que 0"}
        },
        defaultValue: 0
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});
HistoriaUsuario.belongsTo(Kit);

(async ()=>{
    await sequelize.sync();
    const temp = await HistoriaUsuario.findOne({where: {name: null}});
    
    temp.update({name: "pimient"});
})();
module.exports =  {HistoriaUsuario, sequelize}; 
