const express = require('express');
const router = express.Router();
const kitRoute = require('../Contructors/KitController');

router.get('/add', kitRoute.see);
router.post('/api/add', kitRoute.addKit);
router.post('/api/addHU',kitRoute.addHU);


module.exports = router;