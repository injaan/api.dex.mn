module.exports = class Response {
    constructor(success, msg, data, error){
        this.success = success;
        this.msg = msg;
        this.data = data;
        this.error = error;
    }
}