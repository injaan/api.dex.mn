require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
var cors = require('cors')
const port = process.env.PORT || '3001';

//routes
const indexRouter = require('./routes/indexRouter');

var corsOptions = {
    origin: 'https://dex.mn',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var app = express();
app.use(cors(corsOptions))
app.use(helmet());
app.use(express.json({limit:'3mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`app listening on port ${port}!`) 
});