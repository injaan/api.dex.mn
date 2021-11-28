const axios = require("axios");
const fs = require('fs');
const methods = {
    get:async function(address){
        const request = axios.create({
            timeout: 100000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const config = {
            method: 'get'
        }
        let res = await request(address,config);
        if(res.data){
            return res.data;
        } else {
            return null;
        }
    },
    savefile(text){
        return new Promise((resolve)=>{
            fs.writeFile('./save.txt', text.toString(), ()=>{
                resolve(true);
            });
        })
    }
}

module.exports = methods;