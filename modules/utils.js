const axios = require("axios");
const fs = require('fs');
const nodemailer = require("nodemailer");
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
    saveObjectTofile(object, path, filename){
        return new Promise((resolve)=>{
            fs.writeFile(path+'/'+filename, JSON.stringify(object), ()=>{
                resolve(true);
            });
        })
    },
    verifyCaptcha: async function(captchaString){
        const request = axios.create({
            timeout: 100000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        //site key: 6LdeA6sdAAAAAPfjxq3N9deyfMFU5QlmB_Zo-TI8
        const config = {
            data: module.exports.formUrlEncoded({
                secret: "6LdeA6sdAAAAAD1ZqfNYsErW44hx5mjzHzRwzuAZ",
                response: captchaString
            }),
            method: 'post'
        }
        let res = await request('https://www.google.com/recaptcha/api/siteverify',config);
        if(res.data){
            return res.data.success;
        } else {
            return false;
        }
    },
    sendMail:async function(subject, message, html, to){
        const mailtransporter = nodemailer.createTransport({
            host: "us2.smtp.mailhostbox.com",
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
              user: "info@dex.mn",
              pass: "lROYU(JF1"
            },
            tls: { secureProtocol: "TLSv1_method" }
        });
        return new Promise((resolve)=>{
            const messageConfig = {
                from: "DEXMN <info@dex.mn>",
                to: to,
                subject: subject,
                text: message,
                html: html
            };
            mailtransporter.sendMail(messageConfig, function(err, info){
                if(err){
                    console.log(err)
                    resolve(false);
                } else {
                    console.log(info)
                    resolve(true);
                }
            })
        });
    },
    formUrlEncoded: function (x) {
        return Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, '')
    }
}

module.exports = methods;