//Esta parte se parece a los servicios con la base de datos

const { Quiz } = require('../Models/Quiz');

exports.getAllQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.findAll();
        res.render('quizzes/index', { quizzes });
    } catch (err) {
        next(err);
    }
};

exports.showQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findByPk(req.params.id);
        if (quiz) res.render('quizzes/show', { quiz });
        else res.status(404).send('Quiz no encontrado');
    } catch (err) {
        next(err);
    }
};

exports.newQuizForm = (req, res) => {
    res.render('quizzes/new');
};

exports.createQuiz = async (req, res, next) => {
    try {
        await Quiz.create(req.body);
        res.redirect('/quizzes');
    } catch (err) {
        next(err);
    }
};

exports.deleteQuiz = async (req, res, next) => {
    try {
        await Quiz.destroy({ where: { id: req.params.id } });
        res.redirect('/quizzes');
    } catch (err) {
        next(err);
    }
};