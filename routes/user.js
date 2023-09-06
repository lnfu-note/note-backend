const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.post('/api/v1/login', userController.login); // 登入

router.get('/api/v1/users', userController.usersGET);
router.post('/api/v1/users', userController.usersPOST); // 註冊
router.delete('/api/v1/users', userController.usersDELETE);

module.exports = router;