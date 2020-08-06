const { Tour } = require('../../models');

async function tourSearchResult(initInput) {
    const coordinates = initInput.coordinates.split(',').slice().reverse();
    const fromDate = +initInput.dates.split(',')[0];
    const toDate = +initInput.dates.split(',')[1];
    const maxGroupSize = initInput.maxGroupSize;
    const freePlaces = maxGroupSize - initInput.participants;

    const unit = 'km';
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const nearAggregation = Tour.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [coordinates[0] * 1, coordinates[1] * 1] },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
                maxDistance: 53 / multiplier,
                spherical: true,
                includeLocs: "dist.location",
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
        //          // this is like magic, checks if the array contains at lease 3 elements
        //         'starts.participants.3': {
        //             $exists: true
        //         }
        //     }
        // },
        {
            $match: {
                $and: [
                    { 'starts.date': { $gte: new Date(fromDate)}},
                    { 'starts.date': { $lte: new Date(toDate)}}
                ]
            }
        },
        {
            $match: {
                'starts.participantsCount': { $lte: freePlaces}
            }
        }
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
        // //
        // {
        //     $project: {
        //         dist: 1,
        //         distance: 1,
        //         starts: {
        //             $filter: {
        //                 input: '$starts',
        //                 as: 'start',
        //                 cond: {
        //                     $and: [
        //                         {$gte: ['$$start.date', new Date(fromDate)]},
        //                         {$lte: ['$$start.date', new Date(toDate)]}
        //                     ]
        //                 }
        //             }
        //         }
        //     }
        // },
    ])


    // const options = {
    //     page: 1,
    //     limit: 1
    // };
    // const results = await Tour.aggregatePaginate(nearAggregation, options)
    const results = await nearAggregation

    console.log(results.map(p=>p.starts))

    return {
        result: [],
        recommend: [],
    }
}


module.exports = {
    tourSearchResult
}