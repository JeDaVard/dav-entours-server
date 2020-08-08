const { Tour } = require('../../models');

async function findRecommendTours() {
    const tours = await Tour.aggregate([
        { $sample: { size: 8 } },
        { $match: { draft: false }}
    ])
    return tours
}

async function searchTours(initInput) {
    const coordinates = initInput.coordinates.split(',').slice().reverse();
    const fromDate = +initInput.dates.split(',')[0] || Date.now();
    const toDate = +initInput.dates.split(',')[1] || Date.now() + 4 * 365*24*60*60*1000;
    const maxGroupSize = initInput.maxGroupSize;
    const freePlaces = maxGroupSize - initInput.participants;
    const { page, limit } = initInput;

    const unit = 'km';
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const pipeline = [
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [coordinates[1] * 1, coordinates[0] * 1] },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
                maxDistance: 2000 / multiplier,
                spherical: true,
                includeLocs: "dist.location",
            }
        },
        {
            $match: {
                draft: false
            }
        },
        {
            $match: {
                maxGroupSize: {
                    $lte: maxGroupSize
                }
            }
        },
        {
            $lookup: {
                from: "starts",
                localField: "_id",
                foreignField: "tour",
                as: "starts"
            }
        },
        // {
        //     $match: {
        //         $and: [
        //             { 'starts.date': { $gte: new Date(fromDate)}},
        //             { 'starts.date': { $lte: new Date(toDate)}}
        //         ]
        //     }
        // },
        // {
        //     $match: {
        //         'starts.participantsCount': { $lte: freePlaces}
        //     }
        // },
        {
            $addFields: {
                starts: {
                    $filter: {
                        input: '$starts',
                        as: 'start',
                        cond: {
                            $and: [
                                { $gte: ['$$start.date', new Date(fromDate)] },
                                { $lte: ['$$start.date', new Date(toDate)] },
                                { $lte: ['$$start.participantsCount', freePlaces] },
                            ]
                        }
                    }
                }
            }
        },
    ]

    const nearAggregation = Tour.aggregate(pipeline)
    const options = {
        page: page || 1,
        limit: limit || 8
    };

    return Tour.aggregatePaginate(nearAggregation, options);
}

// PIPELINE TRICKS
// {
//     $match: {
//          // this is like magic, checks if the array contains at lease 3 elements
//         'starts.participants.3': {
//             $exists: true
//         }
//     }
// },
// //filter dates and group
// {
//     $unwind: '$starts'
// },
// {
//     $match: {
//         $and: [
//             { 'starts.date': { $gte: new Date(fromDate)}},
//             { 'starts.date': { $lte: new Date(toDate)}}
//         ]
//     }
// },
// {
//     $group: {
//         _id: '$_id',
//         numTourStarts: { $sum: 1 },
//         data: { $push: '$$ROOT'},
//         starts: { $push: '$starts' },
//     },
// },

module.exports = {
    searchTours,
    findRecommendTours
}

