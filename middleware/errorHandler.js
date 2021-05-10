
const Response = require("../modules/response.class");
module.exports = function(err, res) {
    console.log(err)
    res.status(400).send(err.toString());
    return;
}
