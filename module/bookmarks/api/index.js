const fs = require("fs");
let browser = "Firefox";
let id = 10;
const mapBookmarks = (e) => {
    id++;
    if (e.name === "") {
        let n = e.url
            .replace("https://", "")
            .replace("http://", "");
        e.name = n.slice(0, n.indexOf("/"));
    }
    e.id = id;
    e.desc = browser + ` in ${e.folder} (${e.url})`;
    e.type = "website";
    if (!e.icon.startsWith("fa-")) e.icon = e.icon;
    return e;
}

const getBookmarks = async () => {
    let bookmarks = [];
    browser = "Firefox";
    const fox = await require("./firefox")();
    bookmarks = bookmarks.concat(
        fox.map(mapBookmarks)
    );
    let chrome = await require("./chrome")();
    browser = "Chrome";
    bookmarks = bookmarks.concat(
        chrome.map(mapBookmarks)
    );
    return bookmarks;
}

const loadBookmarks = async (home, ready) => {
    const newList = await getBookmarks();
    try {
        fs.unlinkSync(home + "list.json");
    } catch (error) { }
    fs.writeFileSync(home + "list.json", JSON.stringify(newList));
    ready(getList());
}

const getList = () => {
    const home = process.launcher.modulePathData + "/bookmarks.launcher/";
    return JSON.parse(fs.readFileSync(home + "list.json").toString());
}


module.exports = (that, callBack, force = false) => {

    const home = process.launcher.modulePathData + "/bookmarks.launcher/";

    if (!fs.existsSync(home)) {
        fs.mkdirSync(home);
    }
    if (force || !fs.existsSync(home + "list.json")) {
        that.setLoader(true);
        loadBookmarks(home, (list)=>{
            that.setLoader(false);
            callBack(list);
        });
        return callBack([{
            name: "Leesezeichen werden geladen",
            desc: "",
            icon: "fa-link fas"
        }]);
    }
    
    callBack(getList());

}