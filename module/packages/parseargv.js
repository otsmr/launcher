/**
 * ORGINAL: https://github.com/ChaoweiLuo/args-node
 */

function setArgs(args, key, value) {
    if (args.hasOwnProperty(key)) {
        var arg = args[key];
        if (arg instanceof Array && arg.indexOf(value) == -1) {
            arg.push(value);
        } else if (arg != value) {
            var arr = args[key] = [];
            arr.push(arg);
            arr.push(value);
        }
    } else {
        args[key] = value;
    }
}
module.exports = (args) => {
    args = args.split(' ')
    args.reduce((prev, cur, index, arr) => {
        if (prev && prev.indexOf('-') > -1) {
            var key = prev.replace(/\-/g, "");
            var value = true;
            if (key.indexOf('=') > -1) {
                var keys = key.split('=');
                if (keys.length == 2) {
                    key = keys[0];
                    value = keys[1];
                }
            }
            if (cur.indexOf('-') == -1) value = cur;
            setArgs(args, key, value);
        }
        if (index === arr.length - 1 && cur && cur.indexOf('-') > -1) {
            var key = cur.replace(/\-/g, '');
            args[key] = true;
            setArgs(args, key, true);
        }
        return cur;
    });
    let res = {};
    for (const i in args) {
        if (i.match(/[0-9]/)) continue;
        res[i] = args[i];
    }
    return res;
}