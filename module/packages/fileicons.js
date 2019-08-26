const powershell = require("./powershell");
const fs = require("fs");
const path = require("path");

class FileIcons {

    constructor () {

        const home = this.home = process.launcher.modulePathData + "/fileicons/";

        if (!fs.existsSync(home)) {
            fs.mkdirSync(home);
        }

        // Load Cache
        this._icons = {};
        fs.readdir(home, (err, files) => {
            if (err) return;
            for (const file of files) this._icons[file.replace(".png", "")] = home + "\\"+ file
        });

    }

    getIcon (ext) {

        let icon = process.launcher.imgPath + "/explorer/file.png";

        if (this._icons[ext]) {
            icon = this._icons[ext];
        } else if (ext) {
            const saveto = path.join(this.home, ext);
            if (powershell.geticon(ext, saveto)) {
                icon = this._icons[ext] = saveto + ".png";
            }
        }

        return icon;

    }

}

const icons = new FileIcons();

module.exports = (ext) => {
    return icons.getIcon(ext);
}
