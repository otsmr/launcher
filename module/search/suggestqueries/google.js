"use strict";
const request = require('request');
const iconv  = require('iconv-lite');
const getAllSuggestions = (string, call) => {

	const searchURL = "https://suggestqueries.google.com/complete/search?client=chrome&q=";

	request(
        { 
            encoding: null,
            method: "GET",
            uri: searchURL + encodeURIComponent(string)
        }, (err, res, body) => {

	  	if (err || res.statusCode !== 200) return call(err);
        const result = JSON.parse(iconv.decode(new Buffer.from(body), "ISO-8859-1"));
        let suggestions = result[1].map((suggestion, index) => {
            return {
                suggestion: suggestion,
                relevance: result[4]['google:suggestrelevance'][index],
                type: result[4]['google:suggesttype'][index]
            }
        });
        call(null, suggestions);

	});
};

module.exports = (string, call) => {

	getAllSuggestions(string, (err, suggestions) => {
		if (err) call(err);

		let filtered = suggestions.filter((suggestion) => {
			return suggestion.type == "QUERY";
        });

        let res = [];
        for (const item of filtered) res.push(item.suggestion);
		call(res);
    })

}