const express = require('express');
const router = express.Router();
const turnoRoute = require('../Controllers/TurnoController');

router.post('/api/add', turnoRoute.createTurno);


module.exports = router;