
const Response = require("../modules/response.class");
module.exports = function(err, res, code=400, raw=null) {
    console.log(raw)
    res.status(code).send(err.toString());
    return;
}
