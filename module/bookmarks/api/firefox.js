const fs = require('fs')
const path = require("path");
const lz4decoder = require("./lz4decoder");
const execSync = require("child_process").execSync;
const fav = require("fetch-favicon").fetchFavicon;

class BookmarkParse {

    constructor () {
        this.firefoxProfile = path.join(
            execSync("echo %appdata%").toString().replace("\r\n", ""),
            "Mozilla/Firefox/Profiles"
        );
    }

    async parseBookmarks(json) {

        const getChildren = async (items, res, title = "") => {

            for (const item of items) {

                if (item.typeCode === 1) {
                    res.push({
                        name: item.title.replace("-  -", "-"),
                        lastModified: item.lastModified,
                        icon: (item.iconuri != undefined) ? item.iconuri : "fa-link fas",
                        url: item.uri,
                        folder: title
                    });
                }

                if (item.children) {
                    if (title !== "") item.title = title + " > " + item.title;
                    await getChildren(item.children, res, item.title);
                }

            }

        }

        let res = [];
        await getChildren([json], res);
        return res;

    }

    async getBookmarks() {

        const profiles = fs.readdirSync(this.firefoxProfile);

        let bookmarks = [];

        try {

            for (const profil of profiles) {
    
                const src = path.join(this.firefoxProfile, profil, "bookmarkbackups");
                const last = fs.readdirSync(src);
                bookmarks = bookmarks.concat(
                    await this.parseBookmarks(
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
            
        } catch (error) {
            console.log(error);
        }

        return bookmarks;
    }

}

module.exports = async () => {
    return await new BookmarkParse().getBookmarks();
}