const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');

const Teacher = sequelize.define('teacher',
    {
        teacherName: 
        {
            type:DataTypes.STRING, 
            require: true
        },
        userId:{
            type: DataTypes.INTEGER,
            unique: true

        }
    }
);
User.hasOne(Teacher, {foreignKey: 'userId'});
Teacher.belongsTo(User, {foreignKey: 'userId'});

(async ()=>{
    try{
        await sequelize.sync();
        //hay que solventar este error
        /*const temp = await Admin.findOne({where:{id: 2}});
        temp.update({userId: 1});*/
    }catch (err) {
        console.log(err);
    }
})();
module.exports =  {Teacher, sequelize}; 
