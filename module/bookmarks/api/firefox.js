const fs = require('fs')
const path = require("path");
const lz4decoder = require("./lz4decoder");
const execSync = require("child_process").execSync;

class BookmarkParse {

    constructor () {
        this.firefoxProfile = path.join(
            execSync("echo %appdata%").toString().replace("\r\n", ""),
            "Mozilla/Firefox/Profiles"
        );
    }

    parseBookmarks(json) {

        const getChildren = (items, res, title = "") => {

            for (const item of items) {

                if (item.typeCode === 1) {
                    res.push({
                        name: item.title.replace("-  -", "-"),
                        lastModified: item.lastModified,
                        icon: item.iconuri,
                        url: item.uri,
                        folder: title
                    });
                }

                if (item.children) {
                    if (title !== "") item.title = title + " > " + item.title;
                    getChildren(item.children, res, item.title);
                }

            }

        }

        let res = [];
        getChildren([json], res);
        return res;

    }

    getBookmarks() {

        const profiles = fs.readdirSync(this.firefoxProfile);

        let bookmarks = [];

        for (const profil of profiles) {

            const src = path.join(this.firefoxProfile, profil, "bookmarkbackups");
            const last = fs.readdirSync(src);
            bookmarks = bookmarks.concat(
                this.parseBookmarks(
                    JSON.parse(
                        lz4decoder(
                            fs.readFileSync(
                                path.join(src, last[last.length - 1])
                            )
                        )
                    )
                )
            );
        }

        return bookmarks;
    }

}

module.exports = () => {
    return new BookmarkParse().getBookmarks();
}