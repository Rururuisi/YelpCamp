const mongoose = require('mongoose');
const Review = require('./review');

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('resize').get(function () {
    return this.url.replace('/upload', '/upload/w_1000,h_600');
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_250,h_150');
})

const opts = { toJSON: { virtuals: true } };    // add the data of virtual function into the schema

const CampgroundSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties').get(function () {
    return {
        id: this._id,
        title: this.title,
        location: this.location,
        description: this.description
    };
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);