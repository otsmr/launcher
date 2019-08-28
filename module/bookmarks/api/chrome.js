"use strict";
const fs = require("fs");
const fetchFavicon = require('fetch-favicon').fetchFavicon
const pfad = `C:\\Users\\tom\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks`;


class BookmarkParse {

    async parseBookmarks (json) {
        
        const getChildren = async (items, res, title = "") => {

            for (const item of items) {

                if (item.children) {
                    if (title !== "") item.name = title + " > " + item.name;
                    await getChildren(item.children, res, item.name);
                } else {
                    res.push({
                        name: item.name.replace("-  -", "-"),
                        lastModified: item.date_modified || item.date_added,
                        icon: await fetchFavicon(item.url) || "fa-link fas",
                        url: item.url,
                        folder: title
                    });
                }

            }

        }

        let res = [];
        await getChildren([json.roots.bookmark_bar], res);
        return res;

    }

    async getBookmarks () {

        let bok = [];

        try {

            bok = await this.parseBookmarks(
                JSON.parse(
                    fs.readFileSync(pfad).toString()
                )
            )
            
        } catch (error) {
            console.log(error);
        }

        return bok;

    }

}

module.exports = async () => {
    return await new BookmarkParse().getBookmarks();
}