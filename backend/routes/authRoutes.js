const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Register and login routes
router.post('/register', authController.register);
router.post('/login', authController.login)
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

router.get('/view', auth, authController.viewUsers);
router.delete('/delete/:id', auth, authController.deleteUser);

module.exports = router;
