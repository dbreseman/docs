const fs = require('fs');
const path = require('path');

// Define regex pattern to match dates in different formats
const datePattern = /\b(?:\d{1,2}(?:st|nd|rd|th)?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?\b/;

// Define date formats to try parsing
const dateFormats = [
    'MMMM do, yyyy', // January 1st, 2023
    'MMMM dd, yyyy', // January 01, 2023
    'MMMM d, yyyy', // January 2, 2023
    'MMMM yyyy', // January 2023
    'do MMMM, yyyy', // 1st January, 2023
    'dd MMMM, yyyy', // 01 January, 2023
    'd MMMM, yyyy', // 2 January, 2023
    'd MMM yyyy', // 2 Jan 2023
    'd MMMM yyyy', // 2 January 2023
];

// Get the start date and end date for the upcoming month
const today = new Date();
const startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

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
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n');
                lines.forEach((line, lineNumber) => {
                    const datesInLine = line.match(datePattern);
                    if (datesInLine) {
                        datesInLine.forEach(dateStr => {
                            const date = parseDate(dateStr);
                            if (date && date >= startDate && date <= endDate) {
                                dateLines.push(`${filePath}:${lineNumber + 1}:${line.trim()}`);
                            }
                        });
                    }
                });
            }
        }
    };

    searchForDates(directory);
    return dateLines;
};

// Parse date string using multiple formats
const parseDate = (dateStr) => {
    // Replace suffixes like 'st', 'nd', 'rd', 'th' with ''
    dateStr = dateStr.replace(/st|nd|rd|th/g, '');
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// Scan files for dates in the specified directory
const dateLines = scanFilesForDates('content/en/docs');

// Write results to a file
const outputFile = 'dateLines.txt';
fs.writeFileSync(outputFile, dateLines.join('\n'));

// Write file path to standard output
console.log(outputFile);
