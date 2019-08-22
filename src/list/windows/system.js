"use strict";

module.exports = new class {

    get json () {

        const img = process.launcher.imgPath;

        return [
            {
                name: "Herunterfahren",
                desc: "Computer herunterfahren",
                icon: img + "reboot.svg",
                icontyp: "file",
                type: "command",
                command: "shutdown -s -t 0",
                exact: "down"
            },
            {
                name: "Neu starten",
                desc: "Computer neu starten",
                icon: img + "reboot.svg",
                icontyp: "file",
                type: "command",
                command: "shutdown -s -r -t 0",
                exact: "restart"
            },
            {
                name: "Abmelden",
                desc: "Abmelden",
                icon: img + "reboot.svg",
                icontyp: "file",
                type: "command",
                command: "shutdown -l",
                exact: "logoff"
            },
            {
                name: "Sperren",
                desc: "Computer sperren",
                icon: img + "reboot.svg",
                icontyp: "file",
                type: "command",
                command: "rundll32.exe user32.dll, LockWorkStation",
                exact: "lock"
            },
            {
                name: "Energiesparmodus",
                desc: "Computer in den Energiesparmodus versetzen",
                icon: img + "reboot.svg",
                icontyp: "file",
                type: "command",
                command: `powershell "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState( 'Suspend', $false, $false)"`,
                exact: "sleep"
            },
            {
                name: "Powershell",
                desc: "Öffnet die Powershell",
                icon: img + "windows/powershell.png",
                icontyp: "file",
                type: "command",
                command: `cd  %userprofile% & start cmd /c powershell`,
                exact: "ps"
            },
            {
                name: "Kommandozeile",
                desc: "Öffnet die Kommandozeile",
                icon: img + "windows/cmd.png",
                icontyp: "file",
                type: "command",
                command: `cd  %userprofile% & start cmd.exe`,
                exact: "cmd"
            },
            {
                name: "Snipping Tool",
                desc: "Screenshot erstellen einfach gemacht.",
                type: "application",
                icon: img + "windows/SnippingTool.png",
                icontyp: "file",
                path: `C:\\WINDOWS\\system32\\SnippingTool.exe`,
                exact: "snip"
            },
            {
                name: "Task-Manager",
                desc: "Task-Manager öffnen",
                type: "application",
                icon: img + "windows/taskmgr.png",
                icontyp: "file",
                path: `C:\\WINDOWS\\system32\\taskmgr.exe`,
                exact: "task"
            },
            {
                name: "Registry Editor",
                desc: "Registry Editor öffnen",
                type: "application",
                icon: img + "windows/regedit.png",
                icontyp: "file",
                path: `C:\\WINDOWS\\regedit.exe`,
                exact: "regedit"
            },
            {
                name: "Explorer",
                desc: "Explorer öffnen",
                type: "command",
                icon: img + "windows/explorer.png",
                icontyp: "file",
                command: `explorer.exe`,
                exact: "explorer"
            },
            {
                name: "Taschenrechner",
                desc: "Taschenrechner öffneen",
                type: "command",
                icon: img + "calc.svg",
                icontyp: "file",
                command: `calc.exe`,
                exact: "calc"
            }
        ]

    }

}