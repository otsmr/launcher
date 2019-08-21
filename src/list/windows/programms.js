"use strict";

const powershell = require("../../console/powershell");
module.exports = new class {

    constructor () {

        this.iconPath =  process.lauchner.iconPath;
    }

    get json () {

        const list = this.loadList();
        let res = [];
        for (const programm of list) {
            res.push({
                ...programm,
                desc: programm.name + " öffnen",
                icontyp: "file",
                type: "shortcut"
            });
        }

        return res;

    }

    loadList () {

        const getLNK = (path) => {
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
                    icon: item.icon
                });
            }
            return res;
        }

        const sitems = getLNK("$ENV:UserProfile'\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs'");
        const aitems = getLNK("'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs'");
        
        return aitems.concat(sitems);

    }

}