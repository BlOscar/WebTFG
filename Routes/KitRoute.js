const express = require('express');
const router = express.Router();
const kitRoute = require('../Controllers/KitController');
const upload = require('../middleware/multer');
const verify = require('../middleware/auth');

router.get('/add',[verify], kitRoute.see);
router.post('/api/add', kitRoute.addKit);
router.post('/api/addHU',upload.single('imageUrl'),kitRoute.addHU);
router.get('/addHU', kitRoute.seeHU);
router.get('/:id/show', kitRoute.seeKit);
router.get('/addBox',kitRoute.seeBox);
router.post('/api/addBox',upload.array('manualUrl',5),kitRoute.addBox);


module.exports = router;