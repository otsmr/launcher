
# Listitem

```json
[
    {
        "name": String (Optional, wenn desc gegeben),
        "desc": String (Optional, wenn name gegeben),
        "icon": String [path],
        "type": String ["copy", "website", "application", "command", "shortcut", "toinput"],
        "exact": String (Optional),
        "prefix": String (Optional),

        "url": String [Required by "website"],
        "toinput": String [Required by "toinput"],
        "commmand": String [Required by "command"],
        "path": String [Required by "application"],
        "copy": String [Required by "copy"]
    }
]
```