const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const idGen = require('uuid');
const app = express();
// static file server in dir public
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
let registredStream = [];

function ffprobeAsync(streamUrl) {
    return new Promise(function(resolve, reject) {
        const rtmpTimeoutMs = 5000;
        let data = '';
        let ffprobeOptions = [
            streamUrl,
            '-print_format',
            'json',
            '-v',
            'quiet',
            '-show_format',
            //'-show_streams',
            '-pretty'
        ];
        setTimeout(() => {
            ffprobe.kill();
            reject('response timeout');
        }, rtmpTimeoutMs);
        const ffprobe = spawn('ffprobe', ffprobeOptions);
        ffprobe.stdout.on('data', (dataChunk) => {
            data += dataChunk.toString('utf8');
        });

        ffprobe.stderr.on('data', (data) => {
            console.log(`ffprobeAsync stderr: ${data}`);
        });

        ffprobe.on('close', (code) => {
            if (code == 0) {
                resolve({ "message": code, "info": JSON.parse(data).format });
            } else {
                console.log('Ffprobe killed code = ', code);
            }

        });
    });
}
// get info about a stream
app.post('/info', function(req, res) {
    console.log(req.body.inputUrl);
    ffprobeAsync(req.body.inputUrl)
        .then((data) => {
            console.log('data from ffprobeAsync = ', data);
            res.send(data);
        })
        .catch((reason) => {
            res.send({ "message": reason, "info": "Cannot connect to stream!" });
        });
});
// restream stream
let ffmpegRestream;
app.post('/restream', function(req, res) {
    let counter = 0;
    let inputUrl = req.body.inputUrl;
    let outputUrl = req.body.outputUrl;
    let action = req.body.action;
    let ffmpegOptions = [
        '-hide_banner',
        '-re',
        '-i',
        inputUrl,
        '-codec',
        'copy',
        '-f',
        'flv',
        outputUrl
    ];
    if (action == 'run') {
        res.send({ "status": "starting" });

        // set ffmpeg options
        ffmpegRestream = spawn('ffmpeg', ffmpegOptions);

        // yes ffmpeg send status to stderr
        ffmpegRestream.stderr.on('data', (data) => {
            console.log('datachunk #=', counter++);
            console.log(`${data}`);
        });
        ffmpegRestream.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            //res.send({ "status": "closed" });
        });
    } else if (action == 'keep') {
        // do something
    } else if (action == 'kill') {
        ffmpegRestream.kill();
        res.send({ "status": "killed" });
    }


});

function ffmpegSpawnAsync(input, output, action) {
    let ffmpegOptions = [
        '-hide_banner',
        '-re',
        '-i',
        input,
        '-codec',
        'copy',
        '-f',
        'flv',
        output
    ];
    return spawn('ffmpeg', ffmpegOptions);
}
app.post('/addstream', function(req, res) {
    // get info about input stream
    ffprobeAsync(req.body.inputUrl)
        .then((data) => {
            registredStream.push({
                id: idGen.v1(),
                name: req.body.name,
                inputUrl: req.body.inputUrl,
                outputUrl: req.body.outputUrl,
                data: data,
                procObj: ffmpegSpawnAsync(req.body.inputUrl, req.body.outputUrl)

            });
            return registredStream;
        })
        .then((streams) => {
            console.log('streams - ', streams);
            let dataForSend = [];
            streams.forEach((item, i, arr) => {
                dataForSend.push({ "id": item.id, "name": item.name, "inputUrl": item.inputUrl, "outputUrl": item.outputUrl, "data": item.data })
            })
            res.send(dataForSend);
            // streams[0].procObj.stderr.on('data', function(stderr) {
            //     console.log('stderr - ', `${stderr}`);
            // });

        });
    // if input stream ok create stream object in streams array with name, input, id, proc object
    // return info with report and status
});
app.get('/liststreams', function(req, res) {
    let dataForSend = [];
    registredStream.forEach((item, i, arr) => {
        dataForSend.push({ "id": item.id, "name": item.name, "inputUrl": item.inputUrl, "outputUrl": item.outputUrl, "data": item.data })
    })
    res.send(dataForSend);
});
app.delete('/streams', function(req, res) {
    let idToKill = req.body.id;
    console.log('id to kill', idToKill);
    registredStream.forEach((item, i, arr) => {
        if (item.id == idToKill) {
            console.log('item id', item.id);
            item.procObj.kill();
            // remove selected stream srom database
            registredStream.splice(i, 1);

        }
    });
    let dataForSend = [];
    registredStream.forEach((item, i, arr) => {
        dataForSend.push({ "id": item.id, "name": item.name, "inputUrl": item.inputUrl, "outputUrl": item.outputUrl, "data": item.data })
    })
    res.send(dataForSend);
});

app.listen(3003, function() {
    console.log('listening on port 3000!');
});