const { Sequelize, DataTypes, STRING } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });

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
            values: ['profesor', 'alumno'],  // Valores posibles para el rol
            allowNull: false,
            defaultValue: 'alumno',  // Valor por defecto
          }
});


(async () => {  // IIFE - Immediatedly Invoked Function Expresión
    try {
        await sequelize.sync(); // Syncronize DB and seed if needed
        /*const count = await User.count();
        if (count === 0) {
            await User.create(
                {name: "Patata", email: "jkhkjh"}
            );
            console.log(`DB filled with ${c.length} user.`);
        } else {
            console.log(`DB exists & has ${count} users.`);
        }*/
    } catch (err) {
        console.log(err);
    }
})();

module.exports =  {User, sequelize}; 