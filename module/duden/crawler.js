const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
module.exports = new class {

    r(uri, call) {

        request({
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0"
            },
            uri,
            method: 'GET'
        }, (err, res, body) => {
            if (err) call(false);
            call(body);
        })

    }

    search (query, call) {

        const url = "https://www.duden.de/search_api_autocomplete/dictionary_search?display=page_1&&filter=search_api_fulltext&q=" + query;

        this.r(url, (json) => {
            try {

                let res = [];
                json = JSON.parse(json);
                for (const item of json) {
                    let t = item.build;
                    res.push({
                        name: t.slice(t.indexOf("<strong>") + 8, t.indexOf("</strong>")),
                        url: item.value.trim()
                    });
                }
                call(res);

            } catch (error) { }

        });

    }

    getWord (url, call) {

        this.r("https://www.duden.de" + url, (html) => {

            try {

                const $ = cheerio.load(html);

                const $dl = $("dl.tuple");

                let info = {};
                for (const item in $dl) {
                    if (!$dl.hasOwnProperty(item)) continue;
                    const $item = $($dl[item]);
                    const title = $item.children(".tuple__key").text().replace(" INFO", "");
                    const value = $item.children(".tuple__val").text();
                    if (!value || !title) continue;
                    info[title] = value;
                }

                call({
                    Artikel: $(".lemma__determiner").text(),
                    Bedeutung: $("#bedeutung").children("p").text(),
                    ...info
                })
            } catch (error) {
                console.log(error);
            }

        });

    }

}