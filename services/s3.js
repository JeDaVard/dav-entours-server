const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'eu-central-1'
})

function deleteObjects(removeImage) {
    s3.deleteObject({ Bucket: process.env.AWS_ENTOURS_BUCKET, Key: removeImage }, (e,r) => {
        if (e) console.log(e)
    });
    const Objects = removeImage.includes('/tours/')
        ? [
            {Key: removeImage.slice(0, removeImage.length - 4)+'.thumb.jpg'},
            {Key: removeImage.slice(0, removeImage.length - 4)+'.small.jpg'},
            {Key: removeImage},
            {Key: removeImage.slice(0, removeImage.length - 4)+'.large.jpg'},
            ]
        : removeImage.includes('/avatar/')
            ? [
                {Key: removeImage},
                {Key: removeImage.slice(0, removeImage.length - 4)+'.medium.jpg'},
                {Key: removeImage.slice(0, removeImage.length - 4)+'.large.jpg'},
            ]
             : [ {Key: removeImage} ];

    s3.deleteObjects({ Bucket: process.env.AWS_ENTOURS_CDN_BUCKET, Delete: { Objects }
    }, (e,r) => {
        if (e) console.log(e)
    })
}

module.exports = {
    s3,
    deleteObjects
}