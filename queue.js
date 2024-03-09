let queueCallbacks = [];

setInterval(() => {
        const cb = queueCallbacks.shift();
        if(cb) cb();
}, 500);

module.exports = () => {
        return new Promise(async res => {
                queueCallbacks.push(res);
        });
}
