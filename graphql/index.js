exports.root = require('./root')
exports.me = require('./me/me')
exports.conversation = require('./conversation/conversation')
exports.tour = require('./tour/tour')

exports.rootSchema = require('./rootSchema')
exports.userSchema = require('./user/userSchema')
exports.meSchema = require('./me/meSchema')
exports.conversationSchema = require('./conversation/conversationSchema')
exports.tourSchema = require('./tour/tourSchema')
exports.reviewSchema = require('./review/reviewSchema')

module.exports = require('./server')