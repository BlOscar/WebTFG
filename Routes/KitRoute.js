const express = require('express');
const router = express.Router();
const kitRoute = require('../Controllers/KitController');

router.get('/add', kitRoute.see);
router.post('/api/add', kitRoute.addKit);
router.post('/api/addHU',kitRoute.addHU);
router.get('/addHU', kitRoute.seeHU);


module.exports = router;