const Response = require("../modules/response.class");
const utils = require('../modules/utils');
const moment = require("moment");
const models = require('../db/models');

const methods = {
    test:async function(req, res){
        let response = new Response();
        const obj = {
            hello:"world",
            world:"hello"
        }
        await models.Test({
            test:"hello world test"
        }).save();
        response.data = obj;
        response.success = true;
        return response;
    },
    getRoutes:async function(req, res){
        let response = new Response();
        response.success = true;
        return response;
    }
}

module.exports = methods;