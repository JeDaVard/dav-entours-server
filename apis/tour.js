const express = require('express');
const tourControllers = require('../controllers/tour');
const authController = require('../controllers/auth');
const reviewRoutes = require('./review');

const router = express.Router();

router.use('/:tourId/reviews', reviewRoutes);

// Some Business APIs
router
    .route('/top-5-cheapest')
    .get(tourControllers.aliasTopTours, tourControllers.getTours);

router.route('/tour-stats').get(tourControllers.getTourStats);

router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);

router
    .route('/tour-within/:distance/center/:latlng/unit/:unit')
    .get(tourControllers.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistance);

// Tour APIs
router
    .route('/')
    .get(tourControllers.getTours)
    .post(
        authController.auth,
        authController.restrictTo('admin', 'guide', 'user'),
        tourControllers.setUserId,
        tourControllers.addNewTour
    );

router
    .route('/:id')
    .get(tourControllers.getTour)
    .patch(
        authController.auth,
        authController.restrictTo('admin', 'guide', 'user'),
        tourControllers.uploadTourImages,
        tourControllers.resizeTourImages,
        tourControllers.editTour
    )
    .delete(
        authController.auth,
        authController.restrictTo('admin', 'guide', 'user'),
        tourControllers.removeTour
    );

module.exports = router;
