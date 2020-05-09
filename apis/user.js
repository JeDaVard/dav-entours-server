const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');

const router = express.Router();


router.post('/sign-up', authController.authSignUp);
router.post('/login', authController.authLogin);
router.get('/logout', authController.authLogout);
// router.post('/forgot-password', authController.forgotPassword);
// router.patch('/reset-password/token', authController.resetPassword);

router.route('/me').get( authController.auth, userController.getMe ,userController.getUser);
router.patch('/update-password',  authController.auth, authController.updatePassword);
router.delete('/deactivate',  authController.auth, userController.removeUser);
router.patch('/edit',  authController.auth, userController.uploadPhoto, userController.resizeUserPhoto, userController.updateMe);

router.route('/')
    .get(userController.getUsers)
    .post(authController.restrictTo('admin'), userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(authController.restrictTo('admin'), userController.editUser)
    .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
