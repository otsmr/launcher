const request = require("request");
const cheerio = require('cheerio');
const suggest = "https://sayt.wettercomassets.com/suggest/search/"
const apiUrl = "https://www.wetter.com/wetter_aktuell/wettervorhersage/16_tagesvorhersage/deutschland/"

class WetterCom {

    r (uri, call) {

        request({
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0"
            },
            uri,
            method: 'GET'
        }, (err, response, body) => {
            if (err) call(false);
            call(body);
        })

    }

    search (query, call) {

        this.r(suggest + query, (body) => {
            
            try {
                const json = JSON.parse(body).suggest.location[0].options;
                let res = [];
                for (let city of json) {
                    city = city._source;
                    res.push({
                        code: city.originId,
                        name: city.typeSpecificAttributes.admin3.name,
                        desc: city.typeSpecificAttributes.detail
                    });
                }
                call(res);
            } catch (error) { 
                call(false);
            }

        });

    }

    forecast (code, call) {

        this.r(apiUrl + code + ".html", (html) => {

            try {
                
                const $ = cheerio.load(html);
                const items = $("#kalender .weather-grid-item");
    
                let res = [];
                for (let item in items) {
                    item = items[item];
                    if (!item.children) continue;
                    item = $(item);
                    const date = item.find(".date").text();
                    if (date.length > 10) continue;
                    const img = item.find("img");
                    let p = item.find("dl").children().eq(1).text().trim();
                    p = p.slice(0, p.indexOf("%") + 1)
                    res.push({
                        date,
                        icon: "https://proxy.oabos.de/" + img.attr("data-single-src"),
                        smallDesc: img.attr("alt"),
                        longDesc: img.attr("title"),
                        tempMax: item.find(".temp-max").text(),
                        tempMin: item.find(".temp-min").text().replace(" / ", ""),
                        tempFeel: item.find("dl").children().eq(5).text().trim(),
                        rainfall: p,
                        sunHours: item.find("dl").children().eq(3).text().trim(),
                    });
                }
                call(res)
            } catch (error) {
                call({
                    name: "Wetter konnte nicht geladen werden",
                    desc: "",
                    icon: process.launcher.imgPath + "weather.svg",
                    icontyp: "file",
                    type: ""
                })
            }

        });

    }

}

module.exports = new WetterCom();