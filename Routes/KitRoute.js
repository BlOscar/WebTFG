const express = require('express');
const router = express.Router();
const kitRoute = require('../Controllers/KitController');
const upload = require('../middleware/multer');

router.get('/add', kitRoute.see);
router.post('/api/add', kitRoute.addKit);
router.post('/api/addHU',upload.single('imageUrl'),kitRoute.addHU);
router.get('/addHU', kitRoute.seeHU);
router.get('/:id/show', kitRoute.seeKit);


module.exports = router;