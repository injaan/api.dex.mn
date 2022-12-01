require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
var cors = require('cors')
const port = process.env.PORT || '3001';
const dbinit = require('./db/init');
const schedule = require('node-schedule');
const models = require('./db/models');
dbinit();
// const airdrop = require("./controllers/airdrop");
// airdrop.checkAirdropped()

//routes
const indexRouter = require('./routes/indexRouter');
const stakeRouter = require('./routes/stakeRouter');
const proposalRouter = require('./routes/proposalRouter');

var corsOptions = {
    origin: ['https://dex.mn', 'https://wallet.dex.mn', "http://localhost:3000", "https://test.dex.mn"],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

if(process.env.INSTANCE_ID == 0){ //check instance is master
    schedule.scheduleJob('* * * * *', async function(){
        // const update = await models.Proposal.updateMany({date:{$lte:new Date()}, status:"voting"},{
        //     status:'completed'
        // });
        // console.log(update)
        console.log(process.env.INSTANCE_ID)
    });
}

var app = express();
app.use(cors(corsOptions))
app.use(helmet());
app.use(express.json({limit:'3mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/stake', stakeRouter);
app.use('/proposal', proposalRouter);

app.listen(port, () => {
    console.log(`app listening on port ${port}!`) 
});