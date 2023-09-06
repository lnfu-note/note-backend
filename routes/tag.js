const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');

const tagController = require('../controllers/tag');
const { route } = require('./user');

router.get('/api/v1/tags', auth.authenticateToken, tagController.tagsGET);
router.post('/api/v1/tags', auth.authenticateToken, tagController.tagsPOST);
router.delete('/api/v1/tags', auth.authenticateToken, tagController.tagsDELETE);


router.get('/api/v1/tags/:tagId', auth.authenticateToken, tagController.tagNameGET);




// router.put('/api/v1/tags/:tagId', tagController.tagPUT);
// router.delete('/api/v1/tags/:tagId', tagController.tagDELETE);


router.get('/api/v1/tags/:tagId/notes', auth.authenticateToken, tagController.tagNotesGET);


module.exports = router;