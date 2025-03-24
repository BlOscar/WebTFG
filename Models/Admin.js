const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const {User} = require('./User');

const Admin = sequelize.define('admin',
    {
        adminCode: 
        {
            type:DataTypes.STRING, 
            require: true
        }
    }
);

Admin.belongsTo(User);

(async ()=>{
    try{
        await sequelize.sync();
    }catch (err) {
        console.log(err);
    }
})();
module.exports =  {Admin, sequelize}; 
