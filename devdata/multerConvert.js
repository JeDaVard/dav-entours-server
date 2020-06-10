const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
    {
        name: 'imageCover',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 8,
    },
]);

exports.resizeTourImages = async (req, res, next) => {
    if (!req.files) return next();

    if (req.files.imageCover) {
        req.body.imageCover = `tour-cover-${req.params.slug}-${Date.now()}.jpeg`;
        const thumbnail = `${req.body.imageCover.slice(0, req.body.imageCover.length - 5)}.thumb.jpeg`;

        // await sharp(req.files.imageCover[0].buffer)
        //     .resize(2000, 1333)
        //     .toFormat('jpeg')
        //     .jpeg({ quality: 90 })
        //     .toFile(`devdata/converted/${req.body.imageCover}`)

        await sharp(req.files.imageCover[0].buffer)
            .resize(200, 133)
            .toFormat('jpeg')
            .jpeg({quality: 60})
            .toFile(`devdata/converted/${thumbnail}`)
    }
    next();
}

exports.convertImages = async (req, res, next) => {
    res.send('Done!')
}