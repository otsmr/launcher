"use strict";
const request = require('request');
const iconv = require('iconv-lite');

module.exports = (string, call) => {

    const searchURL = "https://api.npms.io/v2/search/suggestions?size=10&q=" + encodeURIComponent(string);
    request({ encoding: null, method: "GET", uri: searchURL }, (err, res, body) => {
        
        if (err || res.statusCode !== 200) call([]);

        let json = [];
        try {
            let res  = JSON.parse(iconv.decode(new Buffer.from(body), "ISO-8859-1"));
            for (const item of res) {
                json.push({
                    name: item.package.name,
                    desc: item.package.description,
                    url: item.package.links.npm
                });
            }
        } catch (error) { }   
        call(json);

    });
};
