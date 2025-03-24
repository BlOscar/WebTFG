const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false });

const Quiz = sequelize.define('quiz', {
    question: { type: DataTypes.STRING, allowNull: false },
    answer: { type: DataTypes.STRING, allowNull: false }
});

(async () => {  // IIFE - Immediatedly Invoked Function Expresión
    try {
        await sequelize.sync(); // Syncronize DB and seed if needed
        const count = await Quiz.count();
        if (count === 0) {
            const c = await Quiz.bulkCreate([
                {question: "Capital of Italy", answer: "Rome"},
                {question: "Capital of France", answer: "Paris"},
                {question: "Capital of Spain", answer: "Madrid"},
                {question: "Capital of Portugal", answer: "Lisbon"}
            ]);
            console.log(`DB filled with ${c.length} quizzes.`);
        } else {
            console.log(`DB exists & has ${count} quizzes.`);
        }
    } catch (err) {
        console.log(err);
    }
})();

module.exports = { Quiz, sequelize };