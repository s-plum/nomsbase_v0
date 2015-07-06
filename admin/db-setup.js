var mongoose = require('mongoose'),
    User = require('../models/user'),
    Counter = require('../models/counter');

mongoose.connect('mongodb://localhost:27017/nomsbase', function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

// create admin user
var admin = new User({
    username: 'nomsbot',
    password: 'TF43k)e$U]?T[+&'
});

admin.save(function(err) {
    if (err) throw err;
    console.log('Admin user created.');
});

//create counters
var counter = new Counter({
    _id: 'recipeid',
    seq: 0
});

counter.save(function(err) {
    if (err) throw err;
    console.log('Recipe counter initialized.');

    process.exit();
});