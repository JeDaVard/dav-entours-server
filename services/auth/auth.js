const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const AppError = require('../../utils/appError');

const authLogin = async ({email, password}) => {
    if (!email) throw new AppError(`Please, provide your email`, 400)
    if (!password) throw new AppError(`Please, provide your password`, 400)

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new AppError(`Account with ${email} doesn't exist`, 404)
    const passwordMatch = await user.correctPassword(password, user.password);
    if (!passwordMatch) throw new AppError(`Incorrect password`, 403);


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const expires = process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;

    // hide password from the output
    user.password = undefined;

    return {
        token,
        expires,
        user
    }
};

const authSignUp = async (args) => {
    const { name, email, password } = args;
    if (!name) throw new AppError(`Please, provide your full name`, 400)
    if (!email) throw new AppError(`Please, provide your email`, 400)
    if (!password) throw new AppError(`Please, provide your password`, 400)

    const user = await User.create({
        name,
        email,
        password,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const expires = process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;

    // here you can send an email to the registered user

    return {
        token,
        expires,
        user
    }
}

module.exports = {
    authSignUp,
    authLogin
}