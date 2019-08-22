const {ipcRenderer} = require('electron');

class List {

    constructor () {
        this.$ul = $("ul");

        ipcRenderer.on("toinput", (event, data, search = true) => {
            $("input").val(data).focus();
            if (search) this.search();

        })

        ipcRenderer.on("add-to-list", (event, json) => {

            if (json.length === 0) {
                this.$ul.fadeOut(0);
                return;
            }
            this.$ul.empty().fadeIn(0);
            let html = "";
            for (const item of json){

                html += `<li toinput="${(item.toinput) ? item.toinput : ""}" list-id="${item.id}" class="${(item.isExact) ? "exact": ""}">
                    <div class="img">
                        <img src="${item.icon}">
                    </div>
                    <div class="text">
                        <h1>${item.name}</h1>
                        <p>${item.desc}</p>
                    </div>
                </li>
                `
            }
            this.$ul[0].scrollTop = 0;
            this.$ul.append(html);
            this.$ul.children().eq(0).addClass("aktiv");

        })
    }

    changeAktiv (dir) {

        let $aktiv = this.$ul.children(".aktiv");
        let index = $aktiv.index();
        if (dir === "ArrowUp") {
            index--;
            if (index <= -1) index = this.$ul.children().length - 1;
            const el = $("input")[0];
            el.selectionStart = el.selectionEnd = el.value.length;
        } else {
            index++;
            if (this.$ul.children().length <= index) index = 0;
        }
        $aktiv.removeClass("aktiv");

        $aktiv = this.$ul.children().eq(index).addClass("aktiv");
        const top = this.$ul[0].scrollTop;
        const bottom = top + this.$ul.height();
        const itemTop = $aktiv[0].offsetTop;
        const itemBottom = itemTop + $aktiv.height();

        if (itemBottom > bottom) {
            this.$ul[0].scrollTop = $aktiv[0].offsetTop - this.$ul.height() + $aktiv.height();
        }
        if (itemTop < top) {
            this.$ul[0].scrollTop = $aktiv[0].offsetTop;
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
        $("input").val("");
        $("ul").empty().fadeOut(0);
        setTimeout(() => {
            ipcRenderer.send('close');
        }, 20);
    });

    ipcRenderer.on("show", () => {
        $("input").prop("readonly", false).focus();
        $("input");
    })
    ipcRenderer.on("hide", () => {
        $("input").prop("readonly", true);
    })

})