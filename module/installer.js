module.exports = [
    {
        installer: require("./battery/battery"),
        id: "battery.launcher"
    },
    {
        installer: require("./calc/calc"),
        id: "calc.launcher"
    },
    {
        installer: require("./duden/duden"),
        id: "duden.dudende"
    },
    {
        installer: require("./explorer/explorer"),
        id: "explorer.launcher"
    },
    {
        installer: require("./filesearch/filesearch"),
        id: "filesearch.launcher"
    },
    {
        installer: require("./programms/programms"),
        id: "programms.launcher"
    },
    {
        installer: require("./quick/quick"),
        id: "quick.launcher"
    },
    {
        installer: require("./screenshot/screenshot"),
        id: "screenshot.launcher"
    },
    {
        installer: require("./search/search"),
        id: "search.launcher"
    },
    {
        installer: require("./speedtest/speedtest"),
        id: "speedtest.launcher"
    },
    {
        installer: require("./translate/translate"),
        id: "translate.google"
    },
    {
        installer: require("./weather/weather"),
        id: "weather.wettercom"
    }
]