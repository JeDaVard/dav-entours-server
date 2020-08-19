const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please, provide your name'],
        },
        email: {
            type: String,
            required: [true, 'Please, provide your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please, provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please, write a password'],
            minlength: 8,
            select: false,
        },
        photo: {
            type: String,
            default: 'assets/icons/default.svg',
        },
        reviews: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Review'
        },
        saved: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Tour'
        },
        role: {
            type: String,
            enum: ['user', 'guide', 'admin'],
            default: 'user',
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Not specified'],
            default: 'Not specified',
        },
        speaks: {
            type: [String],
            default: ['Not specified'],
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    // Only run this function if password was modified
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function(password, dbPassword) {
    return await bcrypt.compare(password, dbPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
