const {deleteObjects} = require("../s3");
const { User } = require('../../models');

async function changeAvatar(_id, photo) {
    const user = await User.findById(_id);

    if (!photo.endsWith('.svg')) {
        await deleteObjects(user.photo.toString());
    }

    user.photo = photo;
    await user.save()

    return user
}

module.exports = {
    changeAvatar
}