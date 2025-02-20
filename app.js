const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const session = require('express-session');
// var grid = require("gridfs-stream");
// var fs = require("fs");
// var multer = require("multer");

// const mongoURI = 'mongodb+srv://bibekitani:Mustang123@cluster0.0mfdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
// // mongoose.connect('mongodb+srv://bitani:ciFM9Uwo13QninZp@cluster5.fnvlk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5')

// mongoose.connect(mongoURI);

// let db = mongoose.connection;

// //Check connection
// db.once('open', function () {
//     console.log('Connected to MongoDB');
// })

// //check for DB errors
// db.on('error', function (err) {
//     console.log(err);
// });

const app = express();

//Bring in Models
// let Article = require('./models/article');
// let Journal = require('./models/user');
// let Subscibers = require('./models/subscibe');
// let Admins = require('./models/admin');
// const article = require('./models/article');

//configure Multer for handling images 

// const upload = multer({ dest: 'uploads/' });


//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Set Public folder

app.use(express.static('public'));

// Session setup
app.use(session({
    secret: 'yourSecretKey', // Change this to a secure key in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, expires: 600000 } // Set to true if using HTTPS
}));

app.get('/', async (req, res) => {

    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    try {

        const articles = await Article.find();
        console.log('Articles fetched:', articles); // Log the full article objects

        // Get the current date in UTC (this will be used to compare the bookings)
        const currentDateUTC = new Date();
        currentDateUTC.setUTCHours(0, 0, 0, 0); // Normalize current date to UTC
        
        const currentDateISOString = currentDateUTC.toISOString(); // Convert current date to ISO string (UTC)

        // Step 1: Flatten all bookings across articles into a single array
        let todaysCheckIns = [];
        let todaysCheckOuts = [];

        let todaysCheckInsCount = 0;
        let todaysCheckOutsCount = 0;

        articles.forEach(article => {
            article.bookings.forEach(booking => {
                // Convert CheckIn and CheckOut dates to UTC (ensure they are in ISO format)
                const checkInDateUTC = new Date(booking.CheckIn).toISOString();
                const checkOutDateUTC = new Date(booking.CheckOut).toISOString();

                // Debugging logs to ensure correct dates
                console.log('Current Date (UTC):', currentDateISOString);
                console.log('Booking CheckIn (UTC):', checkInDateUTC);
                console.log('Booking CheckOut (UTC):', checkOutDateUTC);

                // Filter bookings based on the current date (both in UTC)
                if (checkInDateUTC === currentDateISOString) {
                    todaysCheckIns.push({
                        ...booking,
                        _aid: article._id,
                        _id: booking._id,
                        FirstName: article.FirstName,
                        LastName: article.LastName,
                        kPoints: article.kPoints,
                        Cost: article.Cost,
                        CheckIn: checkInDateUTC,
                        CheckOut: checkOutDateUTC
                    });
                    todaysCheckInsCount += 1;
                }

                if (checkOutDateUTC === currentDateISOString) {
                    todaysCheckOuts.push({
                        ...booking,
                        _aid: article._id,
                        _id: booking._id,
                        FirstName: article.FirstName,
                        LastName: article.LastName,
                        kPoints: article.kPoints,
                        Cost: article.Cost,
                        CheckIn: checkInDateUTC,
                        CheckOut: checkOutDateUTC
                    });
                    todaysCheckOutsCount += 1;
                }
            });
        });

        // Step 4: Sort check-ins and check-outs by date
        console.log('Today\'s Check-Outs:', todaysCheckOuts);
        console.log('Today\'s Check-Ins:', todaysCheckIns);

        const SessionFirstName = req.session.FirstName;
        console.log("logged in as", SessionFirstName);
        res.render('index', {
            title: SessionFirstName,
            checkOuts: todaysCheckOuts,
            checkIns: todaysCheckIns,
            checkOutCounts: todaysCheckOutsCount,
            checkInCounts: todaysCheckInsCount
        });

    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).render('error', { message: 'Failed to load articles', error: err });
    }
});

app.get('/articles/add', function (req, res) {
    res.render('add', {
        title: 'Book a room'
    });
});

app.get('/terms', function (req, res) {
    res.render('terms', {
        title: 'Terms and Conditions'
    });
});

//Add Submit POST route

app.post('/articles/add', async (req, res) => {

    try {

        let customer = await Article.findOne({ EmailAddress: req.body.EmailAddress });

        // Parse the checkIn and checkOut dates (in local time from the request)
        const checkInDate = new Date(req.body.CheckIn); // Assumes req.body.CheckIn is in local time
        console.log("checkInDate (Local):", checkInDate);
        const checkOutDate = new Date(req.body.CheckOut); // Assumes req.body.CheckOut is in local time
        console.log("checkOutDate (Local):", checkOutDate);  

        // Convert to UTC before saving to the database
        const checkInDateUTC = checkInDate.toISOString(); // Converts to UTC (ISO 8601 format)
        const checkOutDateUTC = checkOutDate.toISOString(); // Converts to UTC (ISO 8601 format)

        const PhoneNumber = req.body.PhoneNumber;
        const NOG = req.body.NOG;
        const RoomType = req.body.RoomType;

        // Calculate the number of nights
        const millisecondsPerNight = 24 * 60 * 60 * 1000; // Milliseconds in a day
        const numberOfNights = Math.ceil((checkOutDate - checkInDate) / millisecondsPerNight);

        // Calculate the cost
        const costPerNight = 100;
        const totalCost = numberOfNights * costPerNight;

        // Calculate the Karma Points
        const karmaPerNight = 12;
        const totalKarma = numberOfNights * karmaPerNight;

        // Create a new booking object
        const newBooking = {
            bookingId: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the booking
            CheckIn: checkInDateUTC, // Store CheckIn in UTC format
            CheckOut: checkOutDateUTC, // Store CheckOut in UTC format
            Cost: totalCost,
            PhoneNumber: PhoneNumber,
            NOG: NOG,
            RoomType: RoomType
        };

        if (!customer) {
            customer = new Article({
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                EmailAddress: req.body.EmailAddress,
                kPoints: totalKarma, // Start with this booking's karma points
                bookings: [newBooking], // Add the first booking
                optIn: req.body.optIn
            });

            console.log('New customer created:', customer.FirstName);
        } else {
            // If customer exists, add the new booking to the bookings array
            customer.bookings.push(newBooking);
            customer.kPoints += totalKarma; // Update karma points
            console.log('Booking added for existing customer:', customer.FirstName);
        }

        // Save the article without a callback
        await customer.save(); // No callback function here

        console.log(customer.FirstName); // Log the title for verification
        res.redirect('/'); // Redirect after successful save
    } catch (err) {
        console.error('Error saving article:', err); // Log any errors
        res.status(500).send('Error saving article'); // Send a response if there's an error
    }
});

//Get Booking details
// Route to get individual person's details
// app.get('/person/:articleId/bookings/:personId', async (req, res) => {
//     try {
//         const bookingId = req.params.bookingId;
//         console.log('personId:', bookingId);

//         const person = await Article.findById(bookingId);
//         const person = await Article.findById(bookingId); // Assuming you have a Person model
//         if (!person) {
//             return res.status(404).send('Person not found');
//         }

//         res.render('single-reservation', {
//             article: article
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });

// Get Booking details
// app.get('/articles/:articleId/bookings/:bookingId', async (req, res) => {
//     try {
//         const { articleId, bookingId } = req.params;
//         console.log('articleId:', articleId);
//         console.log('bookingId:', bookingId);

//         if (!bookingId) {
//             return res.status(400).send('Booking ID is required');
//         }

//         const booking = await Booking.findById(bookingId);
//         if (!booking) {
//             return res.status(404).send('Booking not found');
//         }

//         const article = await Article.findById(articleId);
//         if (!article) {
//             return res.status(404).send('Article not found');
//         }

//         console.log(article);
//         res.render('single-reservation', {
//             article: article,
//             bookings: article.bookings
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });


app.get('/details/:id/individual/:aid', async (req, res) => {
    const id = req.params.id; // Extract 'id' from the URL
    const aid = req.params.aid; // Extract 'aid' from the URL
    console.log('Fetching detail with id:', id);
    try {
        // Fetch the details from your database
        const detail = await Article.findById(id);
        const individual = detail.bookings.find(booking => booking._id == aid);
        if (!detail) {
            return res.status(404).send('Detail not found');
        }

        res.render('single-reservation', {
                        bookings: individual
        });

       // res.status(200).json(individual); // Send the fetched detail as a response
    } catch (error) {
        console.error('Error fetching detail:', error);
        res.status(500).send('Server error');
    }
});

app.get('/login/', (req, res) => {
    res.render('login');
});

app.get('/login/', (req, res) => {
    res.render('login');
});

app.get('/login/', (req, res) => {
    res.render('login', {

    });
})

app.get('/signup/', (req, res) => {
    res.render('signup', {
        title: "New Journal submission"
    });
})

// app.post('/api/upload', upload.single('Image'), (req, res) => {
//     res.send('Uploaded successfully');
// })

//Journal POST request

// app.post('/signup', upload.single('Image'), async (req, res) => {

//     try {
//         // Log req.body and req.file to debug the form submission
//         console.log(req.body);  // Should contain Author, Title, and JournalBody
//         console.log(req.file);  // Should contain the uploaded Image

//         let journal = new Journal({
//             Author: req.body.Author,
//             Title: req.body.Title,
//             JournalBody: req.body.JournalBody
//         });

//         if (req.file) {
//             // Save image data in the Journal document
//             journal.Image = {
//                 filename: req.file.originalname,   // Save original filename
//                 contentType: req.file.mimetype,    // Save MIME type (image/jpeg, etc.)
//                 image: req.file.buffer             // Save the image data as a buffer
//             };
//         }


//         // Save the journal entry
//         await journal.save();

//         console.log("Journal successfully submitted: ", journal.Title);
//         res.redirect('/journal/');
//     } catch (err) {
//         console.error('Error submitting the journal:', err);
//         res.status(500).send('Error submitting the journal');
//     }

// });

app.post('/login/', async (req, res) => {
    const { EmailAddress, Password } = req.body;

    try {
        const user = await Admins.findOne({ EmailAddress: EmailAddress });

        if (!user) {
            return res.status(401).send('The user does not exist');
        }

        //Compare the password with the entered password

        if (user.Password != Password) {
            return res.status(401).send('Please re-enter your password!');
        }

        req.session.userId = user._id;
        req.session.FirstName = user.FirstName; // Save first name in session
        res.redirect('/');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }

});

// Example of a protected route
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    const firstName = req.session.FirstName; // Retrieve the first name from session
    res.send(`Welcome to your dashboard, ${firstName}!`); // Display the first name
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }

        // Optionally, clear the session cookie
        res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie name
        res.redirect('/'); // Redirect to the login page after logout
    });
});


app.get('/journal', (req, res) => {

    res.render('journal', {
        title: "Welcome to Bibek's journal"
    })

});

app.get('/resume', (req, res) => {

    res.render('resume', {
        title: "Welcome to Bibek's Resume"
    })

});

app.post('/subscribe', async (req, res) => {

    try {

        let sub = await Subscibers.findOne({ EmailAddress: req.body.EmailAddress });

        if (!sub) {
            sub = new Subscibers({
                EmailAddress: req.body.EmailAddress,
            });

            console.log('New subscriber added:', sub.EmailAddress);
        } else {
            // If customer exists, add the new booking to the bookings array
            console.log("The subscriber is already subscribed!")
        }

        // Save the article without a callback
        await sub.save(); // No callback function here
        res.redirect('/journal'); // Redirect after successful save
    } catch (err) {
        console.error('Error saving article:', err); // Log any errors
        res.status(500).send('Error saving article'); // Send a response if there's an error
    }

});

//Start Server
app.listen(4000, function () {
    console.log('Server started on Port 4000')
});

