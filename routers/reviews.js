const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');



/* -----------campgrounds reviews routing------------ */

router.use(isLoggedIn);

router.post('/', validateReview, catchAsync(reviews.postReview));

router.get('/:reviewId/edit', isReviewAuthor, catchAsync(reviews.editForm));

router.route('/:reviewId')
    .put(isReviewAuthor, validateReview, catchAsync(reviews.updateReview))
    .delete(isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;