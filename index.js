const fs = require('fs');
const path = require('path');
const csvReader = require('csv-reader');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

const allCsv = [];
let merged = [];

// main
readFiles()
    .then(fileNames => readAllCsvs(fileNames))
    .then(() => merge())
    .then(() => writeToMasterFile())
    .then(() => console.log("DONE"))
    .catch(error => console.error("Error: " + error));

function readFiles() {
    const directoryPath = path.join(__dirname, 'input/');
    return fs.promises.readdir(directoryPath);
}

function readAllCsvs(fileNames) {
    const promises = [];
    fileNames.forEach(fileName => promises.push(readCsv(fileName)));
    return Promise.all(promises);
}

function readCsv(fileName) {
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
            console.log("Done readng file: " + fileName);
        })
        .on('error', () => {
            console.error("Erro reading file: " + fileName);
            process.exit(1);
        });

    // give it a second to read the data
    return new Promise((resolve) => setTimeout(resolve, 1000));
}

function merge() {
    console.log("Merging...");

    let classRow = ["Last Name", "First Name", "Email Address"];
    let studentRows = [];
    let fill = 0;

    for (const csv of allCsv) {
        const index = csv.class.findIndex(element => element.startsWith("L"));
        const classNames = csv.class.slice(index);
        classRow = classRow.concat(classNames);
        let numberOfClasses = 0;

        for (const student of csv.students) {
            let studentRow = [];
            studentRow.push(student[0]); // last name
            studentRow.push(student[1]); // first name
            studentRow.push(student[2]); // email address

            for (let i = 0; i < fill; i++) {
                studentRow.push("");
            }

            const grades = student.slice(index);
            numberOfClasses = grades.length;
            studentRow = studentRow.concat(grades);
            studentRows.push(studentRow);
        }

        fill = fill + numberOfClasses;
    }

    merged.push(classRow);
    studentRows.forEach(row => merged.push(row));
    // console.log(JSON.stringify(merged));
}

function writeToMasterFile() {
    const outputFile = "output/master.csv";
    console.log("Writing to master file: " + outputFile);

    const csvWriter = createCsvWriter({
        path: outputFile
    });

    return csvWriter.writeRecords(merged);
}