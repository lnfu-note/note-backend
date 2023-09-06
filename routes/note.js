const express = require('express');
const router = express.Router();
const auth = require('../utils/auth')

const noteController = require('../controllers/note');


router.get('/api/v1/notes', auth.authenticateToken, noteController.notesGET);
router.post('/api/v1/notes', auth.authenticateToken, noteController.notesPOST);
router.delete('/api/v1/notes', auth.authenticateToken, noteController.notesDELETE);


router.get('/api/v1/notes/:noteId', auth.authenticateToken, noteController.noteGET);
router.put('/api/v1/notes/:noteId', auth.authenticateToken, noteController.notePUT);
router.delete('/api/v1/notes/:noteId', auth.authenticateToken, noteController.noteDELETE);

router.post('/api/v1/notes/:noteId/tags/:tagId', auth.authenticateToken, noteController.notetagPOST);
router.delete('/api/v1/notes/:noteId/tags/:tagId', auth.authenticateToken, noteController.notetagDELETE);


module.exports = router;