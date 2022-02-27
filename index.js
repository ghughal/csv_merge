const fs = require('fs');
const path = require('path');
const csvReader = require('csv-reader');

const allCsv = [];

// main
readFiles(filename => {
    readCsv(filename, () => merge());
}, err => {
    throw err;
});

function readFiles(onFile, onError) {
    const directoryPath = path.join(__dirname, 'input/');
    fs.readdir(directoryPath, (err, filenames) => {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(filename => onFile(filename));
    });
}

function readCsv(fileName, onFileRead) {
    console.log("Reading csv file: " + fileName);

    const csv = {};
    csv.fileName = fileName;

    const students = [];
    const inputStream = fs.createReadStream('input/' + fileName, 'utf8');

    inputStream
        .pipe(new csvReader({ parseNumbers: false, parseBooleans: false, trim: true, skipEmptyLines: true, skipHeader: true, asObject: false }))
        .on('data', data => {
            if (data[0].includes("miss")) {
                csv.class = data;
            }

            if (data[2].includes("@")) {
                students.push(data);
            }
        })
        .on('end', () => {
            csv.students = students;
            allCsv.push(csv);
            onFileRead();
            console.log("Done readng file: " + fileName);
        })
}

function merge() {
    console.log("Merging...");

    // console.log("all csv:" + JSON.stringify(allCsv));
    // console.log("all csv:" + allCsv);
}