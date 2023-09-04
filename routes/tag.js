const express = require('express');
const router = express.Router();

const tagController = require('../controllers/tag');
const { route } = require('./user');

router.get('/api/v1/tags', tagController.tagsGET);
router.post('/api/v1/tags', tagController.tagsPOST);
router.delete('/api/v1/tags', tagController.tagsDELETE);

router.put('/api/v1/tags/:tagId', tagController.tagPUT);
router.delete('/api/v1/tags/:tagId', tagController.tagDELETE);


router.get('/api/v1/tags/:tagId/notes', tagController.tagNoteIdsGET);


module.exports = router;