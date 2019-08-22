"use strict";

module.exports = new class {

    constructor() {
        this.toleranz = 1;
    }

    list (query, array){

        let res = this.generateList(query, array, "name");

        res = res.sort(this.compareValues('points', 'desc'));

        let r = [];
        for (const item of res) {
            if (item.points !== 0) r.push(item);
        }

        return r;

    }

    compareValues (key, order='asc') {
        return function(a, b) {
            if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
            const varA = (typeof a[key] === 'string') ?  a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string') ?  b[key].toUpperCase() : b[key];
            let comparison = 0;
            if (varA > varB) comparison = 1;
            else if (varA < varB) comparison = -1;
            return ((order == 'desc') ? (comparison * -1) : comparison);
        };
    }

    findStringInQuery(opt, query, parm){
        for(var i = 0; i<2;i++){
            if(opt.points !== 0) continue;
            //Groß -u. Klein unverändert
            var result = "",
                treffer = "",
                name = opt[parm];
            for(var b in query){
                b = query[b];
                if(i == 0) treffer = name.indexOf(b);
                else treffer = name.toUpperCase().indexOf(b.toUpperCase());
                if(treffer !== -1){
                    treffer++;
                    if(i === 0) result += name.slice(0, treffer).replace(b, "<b>"+b+"</b>");
                    else result += name.slice(0, treffer).replace(new RegExp(b, 'i'), "<b>"+name[treffer - 1]+"</b>");
                    name = name.slice(treffer, name.length);
                }else{
                    result = false;
                    break;
                }
            }
            if(result){
                result += name;
                opt[parm] = result;
                opt.points = query.length;
                if(i === 0)opt.points *= 10;
                else opt.points *= 8;
            }
        }
        return opt;
    }


    generateList(query, inner, parm){
        for(var opt in inner){
            opt = inner[opt];
            opt.points = 0;
            if(typeof opt[parm] !== "string") continue;
            /*
            ##########################################
             erste Buchstaben werden untersucht 1000 / 800 Punkte
            ##########################################
            */
            var querySlice = query;
            for(var i in query){
                if(opt[parm].startsWith(querySlice)){
                    opt.points += 1000 * querySlice.length;
                    opt[parm] = opt[parm].replace(querySlice, "<b>"+querySlice+"</b>");
                    break;
                }
                if(querySlice.length <= query.length - this.toleranz) break;
                querySlice = querySlice.slice(0, -1);
            }
            if(opt.points !== 0) continue;
            var querySlice = query;
            //Bei kleiner Rechtschreibung
            for(var i in query){
                if(opt[parm].toUpperCase().startsWith(querySlice.toUpperCase())){
                    opt.points += 800 * querySlice.length;
                    var name = "<b>"+opt[parm].slice(0, querySlice.length)+"</b>"+opt[parm].slice(querySlice.length, opt[parm].length);
                    opt[parm] = name;
                    break;
                }
                if(querySlice.length <= query.length - this.toleranz) break;
                querySlice = querySlice.slice(0, -1);
            }
            if(opt.points !== 0) continue;
            
            /*
            ##########################################
             Treffer bei der Suche im Wort 100 / 80
            ##########################################
            */
            //Groß -u. Klein unverändert
            if(opt[parm].indexOf(query) !== -1 && query.length !== 0){
                opt[parm] = opt[parm].replace(query, "<b>"+query+"</b>");
                opt.points = query.length * 100;
            }
            if(opt.points !== 0) continue;

            //Groß -u. Klein nicht beachtet
            var upQuery = opt[parm].toUpperCase().indexOf(query.toUpperCase());
            if(upQuery !== -1 && query.length !== 0){
                var frontname = opt[parm].slice(0, upQuery);
                var middlename = "<b>"+opt[parm].slice(upQuery, upQuery+query.length)+"</b>";
                var backename = opt[parm].slice(upQuery+query.length, opt[parm].length);
                
                opt[parm] = frontname + middlename + backename;

                opt[parm] = opt[parm].replace(query, "<b>"+query+"</b>");
                opt.points = query.length * 80;
            }
            if(opt.points !== 0) continue;

            /*
            ##########################################
              Treffer die Buchstabe der query augeteilt
            ##########################################
            */

            this.findStringInQuery(opt, query, parm);
            if(opt.points !== 0) continue;

            /*
            ##########################################
              Treffer der Buchstabe irgendwo in query 
            ##########################################
            */
        
            var treffer = [];
            for(var i in opt[parm]){
                var b = opt[parm][i];
                for(var ii in query)
                    if(!b === "+" && b.toLowerCase() === query[ii].toLowerCase()){
                        var count = (treffer.join("").match(new RegExp(b, "g")) || []).length;
                        var count2 = (opt[parm].match(new RegExp(b, "g")) || []).length;
                        if(count < count2) treffer.push(b);
                    }
            }
            if(query.length !== treffer.length) continue;
            this.findStringInQuery(opt, treffer.join(""), parm);
            if(opt.points !== 0) continue;
        }
        return inner;
    }
}