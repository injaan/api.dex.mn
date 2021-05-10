const errorHandler = require("./errorHandler");
module.exports = function asyncHandler(handler){
    return async (req, res, next) =>{
        try {
            await handler(req, res);
        } catch(ex){
            errorHandler(ex, res);
        }
    }
}