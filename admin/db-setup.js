var mongoose = require('mongoose'),
    async = require('async'),
    User = require('../models/user'),
    Counter = require('../models/counter');

mongoose.connect('mongodb://localhost:27017/nomsbase', function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

async.series([
    function(cb) {
        // create admin user
        var admin = new User({
            username: 'nomsbot',
            password: 'TF43k)e$U]?T[+&'
        });

        admin.save(function(err) {
            console.log('Admin user created.');
            cb(err);
        });
    }, 
    function(cb) {
        //create counters
        var counter = new Counter({
            _id: 'recipeid',
            seq: 0
        });

        counter.save(function(err) {
            console.log('Recipe counter initialized.');
            cb(err);
        });
    }
], function(err, results) {
    if (err) throw err;
    process.exit();
});



