
const Response = require("../modules/response.class");
module.exports = function(err, res, code=400, raw=null) {
    const error = {
        success:false,
        error: err,
        code,
        msg:err.toString()
    }
    res.status(200).send(error);
    return;
}
