const Campground = require('../models/campground');
const Review = require('../models/review');


// Process Leave a Review Action
module.exports.postReview = async (req, res) => {
    const { id } = req.params;
    const review = req.body
    const newReview = new Review(review);
    newReview.author = req.user._id;
    await newReview.save();
    const campground = await Campground.findById(id);
    campground.reviews.push(newReview);
    await Campground.findByIdAndUpdate(id, campground);
    req.flash('success', 'Review created!');
    res.redirect(`/campgrounds/${id}`);
}

// Review Edit Page
module.exports.editForm = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    res.render('campgrounds/reviewEdit', { id, review, title: 'Edit Review' })
}

// Process Edit Review Action
module.exports.updateReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = req.body;
    await Review.findByIdAndUpdate(reviewId, review);
    req.flash('success', 'Review updated!');
    res.redirect(`/campgrounds/${id}`);
}

// Process Delete Review Action
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${id}`);
}