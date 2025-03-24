const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');

const Alumno = sequelize.define('alumno',
    {
        alumnoCode: 
        {
            type:DataTypes.STRING, 
            require: true
        }
    }
);

Alumno.belongsTo(User);

(async ()=>{
    try{
        await sequelize.sync();
    }catch (err) {
        console.log(err);
    }
})();
module.exports =  {Alumno, sequelize}; 
