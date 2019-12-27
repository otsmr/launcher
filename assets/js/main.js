const {ipcRenderer} = require('electron');

class List {

    constructor () {
        this.$ul = $("ul");

        ipcRenderer.on("toinput", (event, data, search = true) => {
            $("input").val(data).focus();
            if (search) this.search();

        })

        ipcRenderer.on("add-to-list", (event, json) => {
            this.addToList(json);

        })
        ipcRenderer.on("add-to-list-after", (event, json) => {
            this.addToList(json, true);
        })
    }

    addToList (json, onlyAfter = false) {
        
        if (json.length === 0) {
            this.$ul.fadeOut(0).empty();
            return;
        }
        if (!onlyAfter) this.$ul.empty();
        this.$ul.fadeIn(0);
        let html = "";
        for (const item of json){

            if (item.display === "category") {
                html += `<div class="category">${item.category}</div>`;
                continue;
            }

            if (item.icon.startsWith("fa-")) {
                item.icon = `<div class="icon"> <i class="${item.icon}"></i> </div>`
            } else {
                item.icon = `<div class="img"> <img src="${item.icon}"> </div>`
            }

            let content = `${item.icon}
            <div class="text">
                <h1>${item.name}</h1>
                <p>${item.desc}</p>
            </div>`;

            if (item.box) {
                content = `
                <div class="box">
                    ${(item.box.pos === "left") ? `<div>${item.box.html}</div>` : ""}
                    <div class="content"> ${content} </div>
                    ${(item.box.pos !== "left") ? `<div>${item.box.html}</div>` : ""}
                </div>
                `
            }

            html += `<li toinput="${(item.toinput) ? item.toinput : ""}" list-id="${item.id}" class="${(item.isExact) ? "exact": ""}">
                ${content}
            </li>
            `
        }
        this.$ul[0].scrollTop = 0;
        this.$ul.append(html);
        this.$ul.children("li").eq(0).addClass("aktiv");
    }

    changeAktiv (dir) {

        let $aktiv = this.$ul.children("li.aktiv");
        let index = $aktiv.index("li");
        if (dir === "ArrowUp") {
            index--;
            if (index <= -1) index = this.$ul.children("li").length - 1;
            const el = $("input")[0];
            el.selectionStart = el.selectionEnd = el.value.length;
        } else {
            index++;
            if (this.$ul.children("li").length <= index) index = 0;
        }
        $aktiv.removeClass("aktiv");

        $aktiv = this.$ul.children("li").eq(index).addClass("aktiv");
        const top = this.$ul[0].scrollTop;
        const bottom = top + this.$ul.height();
        const itemTop = $aktiv[0].offsetTop;
        const itemBottom = itemTop + $aktiv.height();

        if (itemBottom > bottom) {
            this.$ul[0].scrollTop = $aktiv[0].offsetTop - this.$ul.height() + $aktiv.height() + 5;
        }
        if (itemTop < top) {
            this.$ul[0].scrollTop = $aktiv[0].offsetTop;
        }

        if (index === 0) {
            this.$ul[0].scrollTop = 0;
        }

    }

    enter () {

        const $aktiv = this.$ul.children(".aktiv");

        if ($aktiv.length === 1) {
            const id = $aktiv.attr("list-id");
            const toinput = $aktiv.attr("toinput");
            if (toinput !== "") {
                $("input").val(toinput).focus();
                this.search();
            } else {
                const input = $("input").val();
                $("input").val("");
                $("ul").empty().fadeOut(0);
                setTimeout(() => {
                    ipcRenderer.send('run', id, input);
                }, 20);
            }
        }

    }

    search () {
        let input = $("input").val();
        if (input[0] === "=") {
            $("input").val(input.replace(/\\/g, "/"));
            input = $("input").val();
        }
        if (input === "") {
            $("ul").empty().fadeOut(0);
        } else {

            ipcRenderer.send('list-search', input);
            
        }
    }

}

const list = new List();


$(()=>{

    // let timer;
    
    $("input").keyup((e)=>{

        switch (e.key) {
            case "ArrowUp": list.changeAktiv(e.key); break;
            case "ArrowDown": list.changeAktiv(e.key); break;
            case "Enter": list.enter(); break;
            default: list.search(); break;
        }

    }).blur(() => {
        $("input").focus();
        $("input").val("");
        $("ul").empty().fadeOut(0);
        if ($(".settings").is(":hover")) {
            ipcRenderer.send('openSettings');
        }
        setTimeout(() => {
            ipcRenderer.send('close');
        }, 20);
    });

    ipcRenderer.on("show", () => {
        $("input").prop("readonly", false).focus();
        $(".main").addClass("focus");
    })
    ipcRenderer.on("hide", () => {
        $("input").focus();
        $("input").prop("readonly", true);
        $(".main").removeClass("focus");
    })

})