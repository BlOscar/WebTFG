const express = require('express');
const router = express.Router();
const turnoRoute = require('../Controllers/TurnoController');

router.post('/api/add', turnoRoute.createTurno);
router.get('/addTurno', turnoRoute.seeCreateTurno);


module.exports = router;