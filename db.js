const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/SuperSkool',{useNewUrlParser: true, useUnifiedTopology: true});

var db_status = mongoose.connection;

// Ping database if it's connected or not.
db_status.once('open', ()=>{
    console.log("Database connected.\n");
});

//Database connection error.
db_status.on('error', console.error.bind(console, 'connection error:'));
