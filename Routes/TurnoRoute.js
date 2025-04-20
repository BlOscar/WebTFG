const express = require('express');
const router = express.Router();
const turnoRoute = require('../Controllers/TurnoController');

router.post('/api/add', turnoRoute.createTurno);
router.get('/addTurno', turnoRoute.seeCreateTurno);
//router.get('/:id/show', turnoRoute.seeTurno);


module.exports = router;