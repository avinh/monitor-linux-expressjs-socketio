const express = require('express');
const app = express();
const http = require('http').Server(app);
var io = require('socket.io')(http);

var osu = require('node-os-utils');
var netstat = osu.netstat;
var cpu = osu.cpu;
var mem = osu.mem;
var drive = osu.drive;

app.use(express.static('./html/'));
var netstatHistogram = [];
var cpuHistogram = [];
var histogramLength = 61;
var interval = 1000;


http.listen(3000, function () {
    for (let i = 0; i < histogramLength; i++) {
        cpuHistogram[i] = [i, 0];
    }

    for (let i = 0; i < histogramLength; i++) {
        netstatHistogram[i] = [i, 0 , 0];
    }

    setInterval(() => {
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

        mem.info()
            .then(info => {
                io.emit('memory histogram', info);
            })

        drive.info()
            .then(info => {
              io.emit('drive histogram', info);
        })

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
