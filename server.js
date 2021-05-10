require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const port = process.env.PORT || '3001';

//routes
const indexRouter = require('./routes/indexRouter');


var app = express();
app.use(helmet());
app.use(express.json({limit:'3mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`app listening on port ${port}!`) 
});