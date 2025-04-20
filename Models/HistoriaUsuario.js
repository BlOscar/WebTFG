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
    priority: {
        type: DataTypes.INTEGER, 
        require: true, 
        validate: {
            isInt: true,
            min: {args: [0], msg: "the priority must be greater than 0"}
        },
        defaultValue: 0

    },
    size: {
        type: DataTypes.INTEGER, 
        require: true, 
        validate: {
            isInt: true,
            min: {args: [0], msg: "the size must be greater than 0"}
        },
        defaultValue: 0
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
        await sequelize.sync();
        
    }catch(err){
        console.log(err);
    }
})();
module.exports =  {HU, sequelize}; 
