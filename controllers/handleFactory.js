const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');


exports.deleteOne = (Model, isSlug) => catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    let doc;
    if (isSlug) {
        const slug = req.params.slug;
        doc = await Model.deleteOne({slug})
    } else {
        doc = await Model.findByIdAndDelete(_id);
    }

    if (!doc) return next(new AppError('Resource not found', 404));

    res.status(200).json({
        status: 'success',
        data: null,
    });
})

exports.updateOne = (Model, isSlug) => catchAsync(async (req, res, next) => {
    const updates = req.body;
    // console.log(req.formData)

    const _id = req.params.id;

    let doc;
    if (isSlug) {
        const slug = req.params.slug;
        doc = await Model.updateOne({slug}, updates);
    } else {
        doc = await Model.findByIdAndUpdate(_id, updates, {new: true});
    }

    if (!doc) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const data = req.body;

    const doc = await Model.create(data);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
});

exports.getOne = (Model, isSlug, populateOptions) => catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    const slug = isSlug ? req.params.slug : null;

    let query = isSlug ? Model.findOne({ slug }) : Model.findOne({ _id });

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        },
    });
})

exports.getAll = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    // To allow for nested get reviews (a small hack :)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    let tours = populateOptions ? Model.find(filter).populate(populateOptions) : Model.find(filter);

    let features = new APIFeatures(tours, req.query)
        .filter()
        .sort()
        .fieldLimit()
        .paginate(); //Tour.countDocuments())


    let doc = await features.query;

    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc,
        },
    });
})