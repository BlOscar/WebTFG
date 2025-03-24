const express = require('express');
const router = express.Router();
const quizController = require('../Contructors/QuizController');

router.get('/', quizController.getAllQuizzes);
router.get('/new', quizController.newQuizForm);
router.post('/', quizController.createQuiz);
router.get('/:id', quizController.showQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;