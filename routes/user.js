const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.post('/api/v1/login', userController.login);

router.get('/api/v1/users', userController.usersGET);
router.post('/api/v1/users', userController.usersPOST);
router.delete('/api/v1/users', userController.usersDELETE);

router.get('/api/v1/users/:userId', userController.userGET);




module.exports = router;