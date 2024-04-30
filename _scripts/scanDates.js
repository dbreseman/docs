const fs = require('fs');
const path = require('path');

// Define regex pattern to match dates
const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December).{0,6} [0-9]{4}/;

// Function to recursively search for dates in Markdown files
const scanFilesForDates = (directory) => {
    const dateLines = [];

    // Recursive function to search for dates
    const searchForDates = (directory) => {
        const files = fs.readdirSync(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                searchForDates(filePath); // Recursive call for subdirectories
            } else if (file.endsWith('.md')) {
                const lines = fs.readFileSync(filePath, 'utf8').split('\n');
                lines.forEach((line, lineNumber) => {
                    if (line.match(datePattern)) {
                        dateLines.push(`${filePath}:${lineNumber + 1}:${line.trim()}`);
                    }
                });
            }
        }
    };

    searchForDates(directory);
    return dateLines;
};              

// Scan files for dates in the specified directory
const dateLines = scanFilesForDates('content/en/docs');

// Print filename, line number, and text containing dates
dateLines.forEach((dateLine) => {
    const [filename, lineNumber, lineText] = dateLine.split(':');
    console.log(`File: ${filename}`);
    console.log(`Line: ${lineNumber}`);
    console.log(`Text: ${lineText}`);
    console.log("---");
});

// Set outputs for subsequent steps
const scanOutput = dateLines.join('\n');
console.log(`::set-output name=scan_output::${scanOutput}`);
