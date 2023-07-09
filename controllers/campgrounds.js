const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });


// Campgrounds Page
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds, title: `Campgrounds` });
}

// Add Page
module.exports.newForm = (req, res) => {
    res.render('campgrounds/new', { title: "New Campground" });
}

// Process Add New Campground Action
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Campground added!');
    res.redirect(`/campgrounds/${campground.id}`);
}

// Show Page
module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', "Can not find the campground!");
        return res.redirect('/campgrounds');
    }
    let ratingSum = 0;
    for (let review of campground.reviews) {
        ratingSum += review.rating;
    }

    let ratingAverage = "[No Rating]";
    if (campground.reviews.length !== 0) {
        ratingAverage = (ratingSum / campground.reviews.length).toFixed(1);
    }
    req.session.returnTo = req.originalUrl;
    res.render('campgrounds/show', { campground, ratingAverage, title: `${campground.title}` });
}

// Edit Page
module.exports.editForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground, title: `Edit` });
}

// Process Edit Campground Info Action
module.exports.updateCampground = async (req, res) => {
    const getData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    campground.geometry = getData.body.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Campground info updated!');
    res.redirect(`/campgrounds/${id}`);
}

// Process Delete Campground Action
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    for (let img of campground.images) {
        if (img.url.includes('cloudinary')) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}