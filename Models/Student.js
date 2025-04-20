const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');

const Student = sequelize.define('student',
    {
        studentName: 
        {
            type:DataTypes.STRING, 
            require: true
        }
    }
);
User.hasOne(Student, {foreignKey: 'userId'});
Student.belongsTo(User);

(async ()=>{
    try{
        await sequelize.sync();
    }catch (err) {
        console.log(err);
    }
})();
module.exports =  {Student, sequelize}; 
