const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.originalUrl.includes("/review")) {
            const end = req.originalUrl.indexOf("/review");
            req.originalUrl = req.originalUrl.slice(0, end);
        } else if (req.originalUrl.includes("?_method=")) {
            const end = req.originalUrl.indexOf("?_method=");
            req.originalUrl = req.originalUrl.slice(0, end);
        }
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in!");
        return res.redirect("/login");
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// check whether the campground has existed
module.exports.isExist = async (req, res, next) => {
    const { title } = req.body.campground;
    Campground.find({ title }).then(data => {
        if (data.length === 0) {
            next();
        } else {
            res.render('alert', {
                title: "Action Failed",
                info: "Campground already exists. You can try to update it. ",
                backTo: "/campgrounds"
            });
        }
    });
}

// check client input campground validation
module.exports.validateCampground = (req, res, next) => {
    const campground = JSON.parse(JSON.stringify(req.body.campground));
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const { error } = campgroundSchema.validate({ campground });
    if (error) {
        const msg = error.details.map(err => err.message).join(', ');
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

// check client input review validation
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate({ review: req.body });
    if (error) {
        const msg = error.details.map(err => err.message).join(', ');
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Can't find the campground! ");
        return res.redirect(`/campgrounds`);
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Can't find the review! ");
        return res.redirect(`/campgrounds/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}