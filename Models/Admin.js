const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');

const Admin = sequelize.define('admin',
    {
        adminCode: 
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
User.hasOne(Admin, {foreignKey: 'userId'});
Admin.belongsTo(User, {foreignKey: 'userId'});

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
module.exports =  {Admin, sequelize}; 
