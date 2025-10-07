const { Sequelize, DataTypes, STRING } = require('sequelize');
const {UserRole} = require('../enums/userRoles');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });
const bcrypt = require('bcrypt');


const User = sequelize.define('user',{
    username: 
    {
        type:DataTypes.STRING, unique: true, require: [true, "se necesita un nombre de usaurio"]
    },
    name: 
        {
            type: DataTypes.STRING, allowNull: false, require: { msg: "Name already exists"}
        },
        email: 
        {
            type: DataTypes.STRING, allowNull: false, unique : true
        },
        password:{
            type: DataTypes.STRING, allowNull: false, require: [true, "La contraseña es obligatoria"]
        },
        role: {
            type: DataTypes.ENUM,
            values: [UserRole.Teacher, UserRole.Student],  // Valores posibles para el rol
            allowNull: false,
            defaultValue: UserRole.Student,  // Valor por defecto
          }
});


(async () => {  // IIFE - Immediatedly Invoked Function Expresión
    try {
        await sequelize.sync(); // Syncronize DB and seed if needed
        const count = await User.count();
        if (count === 0) {
            const password = await bcrypt.hash("Profesor",10)
            await User.create(
                {name: "Profe", username:"Profe", email: "profe@gmail.com", password: password, role: UserRole.Teacher }
            );
            console.log(`DB filled with a teacher user.`);
        } 
    } catch (err) {
        console.log(err);
    }
})();

module.exports =  {User, sequelize}; 