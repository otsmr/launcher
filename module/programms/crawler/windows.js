"use strict";
const powershell = require("../../packages/powershell");
const fs = require("fs");
const path = require("path");

class Crawler {

    constructor (home) {

        this.iconPath =  home + "icons/";

    }

    get json () {

        const list = this.loadList();
        let res = [];
        for (const programm of list) {
            res.push({
                ...programm,
                desc: programm.name + " öffnen",
                icontyp: "file"
            });
        }

        return res;

    }

    loadDefaultApplication (path) {
        const befehl = `
        Function Get-Icon {

            Param ( 
                [string]$Path,
                [string]$IconPath
            )
        
            [System.Reflection.Assembly]::LoadWithPartialName('System.Drawing')  | Out-Null
        
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($Path)
            $iconPng = [System.Drawing.Icon]::ExtractAssociatedIcon($Path).ToBitmap().Save("$IconPath\\$baseName.png")
            return "$IconPath\\$baseName.png"
        
        };            
        $WScript = New-Object -ComObject WScript.Shell;
        Get-ChildItem -path ${path} -recurse -Include *.lnk | 
        ForEach-Object {
            $WScript.CreateShortcut($_.FullName)
        } | 
        select-object -Property FullName, IconLocation, TargetPath, icon |
        ForEach-Object {
            Try {
                $_.icon = Get-Icon -Path $_.TargetPath -IconPath '${this.iconPath}'
            } Catch {}
            $_
        }`;
        const json = powershell.getJSON(befehl, [
            "FullName",
            "TargetPath",
            "IconLocation",
            "icon"
        ]);
        let res = [];
        for (const item of json) {
            const path = item.TargetPath;
            if (!path || path === null || !path.endsWith('.exe')) continue;
            if (path.endsWith("unins000.exe")) continue;
            const p = item.FullName;
            const name = p.slice(p.lastIndexOf("\\") + 1, p.length).replace(".lnk", "");
            if (name.startsWith("Uninstall")) continue;
            res.push({ 
                name,
                path: item.FullName,
                icon: item.icon,
                type: "shortcut"
            });
        }
        return res;
    }

    loadWindowsStoreApps () {

        const apps = powershell.getJSON("Get-AppxPackage", [
            "Name",
            "PackageFullName",
            "InstallLocation"
        ]);

        const allowed = [
            "Microsoft.MicrosoftEdge",
            "Microsoft.MSPaint",
            "Microsoft.MicrosoftMahjong",
            "Microsoft.Alarms",
            "Microsoft.WindowsStore",
            "Microsoft.Windows.Photos",
            "Microsoft.ScreenSketch",
            "Microsoft.MicrosoftStickyNotes",
            "Microsoft.WindowsCamera",
            "Microsoft.MicrosoftSolitaireCollection",
            "Microsoft.ZuneMusic",
            "Microsoft.ZuneVideo"
        ];

        const getManifest = (app) => {

            const pfad = path.join(app.InstallLocation, "AppxManifest.xml");
            const xml = fs.readFileSync(pfad).toString();
            const logoName = xml.match(new RegExp("<Logo>(.*?)</Logo>"))[1];
            
            const files = fs.readdirSync(path.dirname(path.join(app.InstallLocation, logoName)));
            const startFileWidth = path.basename(logoName).replace(path.extname(path.basename(logoName)), "");
            let icon = false;

            let iconWhite = false;
            for (const file of files) {
                if (file.startsWith(startFileWidth) && (file.endsWith(".png") || file.endsWith(".jpg"))) {
                    if (file.indexOf("contrast-white") > -1) {
                        iconWhite = file;
                        break;
                    }
                    if (file.indexOf("scale") > -1) icon = file;
                }
            }
            if (iconWhite) icon = iconWhite;
            if (!icon) icon = "";

            let zune = false;
            let name = xml.match(new RegExp("<DisplayName>(.*?)</DisplayName>"))[1];

            if (name.startsWith("ms-resource:")) {
                if (app.Name.indexOf("Zune") > -1) zune = true;
                name = app.Name.split(".").slice(1).join(" ").replace("Zune", "")
            }
            
            return {
                name, zune,
                icon: path.join(app.InstallLocation, path.dirname(logoName), icon)
            }

        }

        const openApxPS = (name, zune = false) => {
            return `
            function open-appx {
                Param ( 
                    [string]$Name
                )
                $pkgName = (Get-AppxPackage -Name $Name).PackageFamilyName;
                $Proc = @{
                    FilePath = 'explorer.exe'
                    ArgumentList = "shell:AppsFolder\\$pkgName!${(zune) ? name : "App"}"
                    ${(zune) ? "" : "Verb = 'RunAs'"}
                };
                Start-Process @proc;
            };
            open-appx -Name ${name}`;
        }

        let appList = [];
        for (const app of apps) {
            if (allowed.indexOf(app.Name) === -1){
                const name = app.Name.toLowerCase();
                if (name.startsWith("microsoft.")) continue;
                if (name.startsWith("windows.")) continue;
                if (app.InstallLocation.startsWith("C:\\Windows\\SystemApps\\")) continue;
            }
            const manifest = getManifest(app);
            appList.push({
                ...manifest,
                type: "commandps",
                command: openApxPS(app.Name, manifest.zune)
            });
        }

        return appList;       

    }

    loadList () {


        const storeApps = this.loadWindowsStoreApps();
        const sitems = this.loadDefaultApplication("$ENV:UserProfile'\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs'");
        const aitems = this.loadDefaultApplication("'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs'");
        
        return aitems.concat(sitems.concat(storeApps));

    }

}

module.exports = (home, force = false) => {

    try {
        const listFile = fs.statSync(home + "list.json");
        const birth = new Date(listFile.mtime).getTime();
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const last24 = d.getTime();
        if (birth < last24) force = true;
    } catch (error) {
        force = true;
    }
    
    if (force) {
        const newList = new Crawler(home).json;
        fs.unlinkSync(home + "list.json");
        fs.writeFileSync(home + "list.json", JSON.stringify(newList));
        return newList;
    }

    return JSON.parse(fs.readFileSync(home + "list.json").toString());

}