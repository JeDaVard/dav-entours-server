const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppError = require('../utils/appError');

exports.authLogout = (req, res) => {
    res.cookie('token', 'loggedOut(dummyText)', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

// exports.updatePassword = catchAsync(async (req, res, next) => {
//     // 1) Get user from collection
//     const user = await User.findById(req.user.id).select('+password');
//
//     // 2) Check if POSTed current password is correct
//     if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//         return next(new AppError('Your current password is wrong.', 401));
//     }
//
//     // 3) If so, update password
//     user.password = req.body.password;
//     user.passwordConfirm = req.body.passwordConfirm;
//     await user.save();
//     // User.findByIdAndUpdate will NOT work as intended!
//
//     // 4) Log user in, send JWT after password changed
//     createSendToken(user, req, res);
// });

// exports.restrictTo = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return next(new AppError('You do not have permission to perform this action', 403))
//         }
//         next()
//     }
// };

// Only for rendered pages, no errors!
// exports.isLoggedIn = async (req, res, next) => {
//     if (req.cookies.token) {
//         try {
//             // 1) verify token
//             const decoded = await promisify(jwt.verify)(
//                 req.cookies.token,
//                 process.env.JWT_SECRET
//             );
//
//             // 2) Check if user still exists
//             const currentUser = await User.findById(decoded.id);
//             if (!currentUser) {
//                 return next();
//             }
//
//             // 3) Check if user changed password after the token was issued
//             if (currentUser.changedPasswordAfter(decoded.iat)) {
//                 return next();
//             }
//
//             // THERE IS A LOGGED IN USER
//             res.locals.user = currentUser;
//             return next();
//         } catch (err) {
//             return next();
//         }
//     }
//     next();
// };

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//     const { email } = req.body
//     const user = await User.findOne({ email })
//
//     if (!user) return next(new AppError('User not found', 404));
//
//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false })
//
//     try {
//         const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
//         await new Email(user, resetURL).sendPasswordReset();
//
//         res.status(200).json({
//             status: 'success',
//             message: 'Token sent to your email, it will be valid for 10 minutes, otherwise you can come back and re-send a new one.'
//         })
//     } catch (e) {
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;
//
//         await user.save({ validateBeforeSave: false})
//
//         return next(new AppError('There was an error while sending the email. Please, try again.', 500))
//     }
// });
//
// exports.resetPassword = catchAsync(async (req, res, next) => {
//     // 1) Get user based on the token
//     const hashedToken = crypto
//         .createHash('sha256')
//         .update(req.params.token)
//         .digest('hex');
//
//     const user = await User.findOne({
//         passwordResetToken: hashedToken,
//         passwordResetExpires: { $gt: Date.now() }
//     });
//
//     // 2) If token has not expired, and there is user, set the new password
//     if (!user) {
//         return next(new AppError('Token is invalid or has expired', 400));
//     }
//     user.password = req.body.password;
//     user.passwordConfirm = req.body.passwordConfirm;
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save();
//
//     // 3) Update changedPasswordAt property for the user
//     // 4) Log the user in, send JWT
//     createSendToken(user, 200, req, res);
// });