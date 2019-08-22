"use strict";
const request = require('request');
const iconv = require('iconv-lite');

module.exports = (string, call) => {

    const searchURL = "https://duckduckgo.com/ac/?callback=&q=" + encodeURIComponent(string);
    request({ encoding: null, method: "GET", uri: searchURL }, (err, res, body) => {
        
        if (err || res.statusCode !== 200) call([]);

        let json = [];
        try {
            const res = JSON.parse(iconv.decode(new Buffer.from(body), "ISO-8859-1"));
            for (const item of res) json.push(item.phrase);
        } catch (error) { console.log(error); }   
        call(json);

    });
};
