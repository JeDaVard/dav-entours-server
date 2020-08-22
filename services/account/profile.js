const {deleteObjects} = require("../s3");
const { User } = require('../../models');

async function changeAvatar(_id, photo) {
    const user = await User.findById(_id);

    if (user.photo && !user.photo.toString().includes('default')) {
        await deleteObjects(user.photo.toString());
    }

    user.photo = photo;
    await user.save()

    return user
}

async function deactivateMe(_id) {
    return await User.findByIdAndUpdate({_id}, { active: false })
}

module.exports = {
    changeAvatar,
    deactivateMe
}