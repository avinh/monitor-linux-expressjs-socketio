const express = require('express');
const app = express();
const http = require('http').Server(app);
var io = require('socket.io')(http);

const si = require('systeminformation')
const nosu = require('node-os-utils');

app.use(express.static('./html/'));
var netstatHistogram = [];
var cpuHistogram = [];
var histogramLength = 61;
var interval = 1000;


http.listen(3000,function () {
    for (let i = 0; i < histogramLength; i++) {
        cpuHistogram[i] = [i, 0];
    }

    for (let i = 0; i < histogramLength; i++) {
        netstatHistogram[i] = [i, 0, 0];
    }

    setInterval(async () => {
        var netstat = nosu.netstat;
        var cpu = nosu.cpu;

        cpu.usage()
            .then(value => {
                updateCpuHistogram(value);
                io.emit('cpu histogram', cpuHistogram);
            })

        netstat.inOut()
            .then(info => {
                updateNetstatHistogram(parseInt(info.total.outputMb), parseInt(info.total.inputMb));
                io.emit('netstat histogram', netstatHistogram);
            })

            
        let system = {};

        system.memory = await si.mem();
        let storage = (await si.fsSize())[0];
        system.storage = {total:storage.size,used:storage.used};

        io.emit('memory histogram', system.memory);
        io.emit('drive histogram', system.storage);

    }, interval);
});

function updateCpuHistogram(cpuLoad) {
    if (cpuHistogram.length >= histogramLength) {
        cpuHistogram.shift();
    }

    cpuHistogram.push([0, cpuLoad]);

    for (let i = 0; i < histogramLength; i++) {
        cpuHistogram[i][0] = i;
    }
}

function updateNetstatHistogram(inLoad, outLoad) {
    if (netstatHistogram.length >= histogramLength) {
        netstatHistogram.shift();
    }

    netstatHistogram.push([0, inLoad, outLoad]);

    for (let i = 0; i < histogramLength; i++) {
        netstatHistogram[i][0] = i;
    }
}
