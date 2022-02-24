const express = require('express');
const bodyParser = require('body-parser');
const multer = require("multer");
const p = require('path');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `file-${Date.now()}.${ext}`);
    },
});
const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "mp3") {
        cb(null, true);
    } else {
        const error = new Error("Not a MP3 File!!");
        console.log(error.message);
        cb(error, false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
const app = express();
const port = 3000;

app.get('/voice-recorder/:name', (req, res) => {
    try {
        const name = req.params.name;
        const options = {
            root: "public/"
        };
        const fileName = name + '.mp3';
        res.sendFile(fileName, options, function (err) {
            if (err) {
                res.status(200).send({
                    'ResponseCode': '500',
                    'exceptionMessage': err,
                    'message': "",
                    'data': ""
                })
            } else {
                console.log('Sent:', fileName);
            }
        });
    } catch (e) {
        console.log(e.message);
        res.status(200).send({
            'ResponseCode': '500',
            'exceptionMessage': "Error while uploading file : " + e.message,
            'message': "",
            'data': ""
        })
    }
});

app.post('/voice-recorder', upload.single("audioData"), async (req, res) => {
    try {
        res.status(200).send({
            'ResponseCode': '200',
            'exceptionMessage': "",
            'message': "File uploaded successfully",
            'data': {fileName: p.parse(req.file.filename || "").name}
        })
    } catch (e) {
        console.log(e.message);
        res.status(200).send({
            'ResponseCode': '500',
            'exceptionMessage': "Error while uploading file : " + e.message,
            'message': "",
            'data': ""
        })
    }
});

app.get('*', function (req, res) {
    res.send("Sorry !");
});


app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({extended: true}, {limit: '150mb'}));
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Dashboard server listening at port:${port}`);
});

process.on('uncaughtException', function (err, next) {
    console.log(err);
    process.exit(0);
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(0);
})
