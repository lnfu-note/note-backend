const express = require('express');
const router = express.Router();
const auth = require('../utils/auth')

const noteController = require('../controllers/note');

router.get('/api/v1/notes/:noteId', auth.authenticateToken, noteController.noteGET);
router.put('/api/v1/notes/:noteId', noteController.notePUT);
router.delete('/api/v1/notes/:noteId', noteController.noteDELETE);

router.get('/api/v1/notes/:noteId/tags', noteController.noteTagIdsGET);

router.post('/api/v1/notes/:noteId/tags/:tagId', noteController.notetagPOST);
router.delete('/api/v1/notes/:noteId/tags/:tagId', noteController.notetagDELETE);

router.get('/api/v1/notes', auth.authenticateToken, noteController.notesGET);
router.post('/api/v1/notes', auth.authenticateToken, noteController.notesPOST);
router.delete('/api/v1/notes', auth.authenticateToken, noteController.notesDELETE);

module.exports = router;