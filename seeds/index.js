if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const { cloudinary } = require('../cloudinary');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp';
const yelpCampId = process.env.YELPCAMP_USER_ID;


const connectDB = async () => {
    await mongoose.connect(dbUrl);
    console.log('Database Connected! ');
}


const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

const sample = array => array[Math.floor(Math.random() * array.length)];

const imagesGenerator = async () => {
    const num = randomNumber(1, 5);
    const images = [];
    for (let i = 0; i < num; i++) {
        const random = randomNumber(0, cities.length - 1);
        const img = await cloudinary.uploader.upload(`https://picsum.photos/1000/600?random=${random}`, {
            folder: 'YelpCamp',
            use_filename: false
        });
        images[i] = {
            url: img.url,
            filename: img.public_id
        }
    }
    return images;
}

const clearCampgrounds = async () => {
    console.log("Clearing Campgrounds Data......");
    const campgrounds = await Campground.find({});
    for (let campground of campgrounds) {
        for (let img of campground.images) {
            if (img.url.includes('cloudinary')) {
                await cloudinary.uploader.destroy(img.filename);
            }
        }
        await Campground.deleteOne({ '_id': campground._id });
    }
    console.log("Clearing Completed! ");
}

const seedDB = async () => {
    try {
        await connectDB();
        await clearCampgrounds();
        await Campground.deleteMany({});
        console.log("Inserting Seeds......");
        for (let i = 0; i < 50; i++) {
            const randCity = randomNumber(0, cities.length - 1);
            const price = randomNumber(10, 30);
            const camp = new Campground({
                title: `${sample(descriptors)} ${sample(places)}`,
                author: yelpCampId,
                location: `${cities[randCity].city}, ${cities[randCity].state}`,
                geometry: {
                    type: 'Point',
                    coordinates: [cities[randCity].longitude, cities[randCity].latitude]
                },
                images: await imagesGenerator(),
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat molestiae dolores natus reprehenderit voluptatibus ipsam, optio, nesciunt, hic maxime nulla ullam? Sint animi aspernatur saepe mollitia temporibus provident aliquam voluptatum.',
                price
            });
            await camp.save();
        }
        await Campground.find({}).populate('images').then(data => {
            console.log(`Total ${data.length} Seeds Inserted! `);
        })
    } catch (err) {
        console.log(err.message);
    }
}

seedDB().then(() => {
    console.log('Database Connection Closed! ');
    mongoose.connection.close();
});

