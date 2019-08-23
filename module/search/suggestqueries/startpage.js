"use strict";
const request = require('request');
const iconv = require('iconv-lite');

module.exports = (string, call) => {

    const searchURL = "https://www.startpage.com/do/suggest?limit=10&lang=deutsch&format=json&query=" + encodeURIComponent(string);
    request({ encoding: null, method: "GET", uri: searchURL }, (err, res, body) => {
        
        if (err || res.statusCode !== 200) call([]);

        let json = [];
        try {
            json = JSON.parse(iconv.decode(new Buffer.from(body), "ISO-8859-1"))[1];
        } catch (error) { }   
        call(json);

    });
};
