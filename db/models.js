const fs = require('fs');
const mongoose = require('mongoose');

let models = {};
fs.readdirSync("./db/schemas").forEach(function(file) {
    const schemaName = file.split('.')[0];
    models[schemaName] = mongoose.model(schemaName, require('./schemas/'+schemaName));
});
module.exports = models;