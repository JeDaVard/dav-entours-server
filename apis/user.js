const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');

const router = express.Router();


router.post('/sign-up', authController.authSignUp);
router.post('/login', authController.authLogin);
router.get('/logout', authController.authLogout);
// router.post('/forgot-password', authController.forgotPassword);
// router.patch('/reset-password/token', authController.resetPassword);

// all routes are protected after this middleware
router.use(authController.auth)

router.route('/me').get( userController.getMe ,userController.getUser);
router.patch('/update-password', authController.updatePassword);
router.delete('/deactivate', userController.removeUser);
router.patch('/edit', userController.uploadPhoto, userController.resizeUserPhoto, userController.updateMe);

// all routes are restricted to admin after this middleware
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.editUser)
    .delete(userController.deleteUser);

module.exports = router;
