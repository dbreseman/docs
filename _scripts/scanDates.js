const fs = require('fs');
const path = require('path');
const { parse } = require('date-fns');

// Define regex pattern to match dates in different formats
const datePattern = /\b(?:\d{1,2}\s*(?:st|nd|rd|th)?,?\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s+\d{4})?\b/;

// Define date formats to try parsing
const dateFormats = [
    'MMMM yyyy', // January 2023
    'MMMM d, yyyy', // January 2, 2023
    'MMMM do, yyyy', // January 2nd, 2023
    'MMMM dd, yyyy', // January 22, 2023
    'do MMMM, yyyy', // 22 January, 2023
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
    for (const format of dateFormats) {
        try {
            const date = parse(dateStr, format, new Date());
            if (!isNaN(date.getTime())) {
                return date;
            }
        } catch (error) {
            continue;
        }
    }
    return null;
};

// Scan files for dates in the specified directory
const dateLines = scanFilesForDates('content/en/docs');

// Print filename, line number, and text containing dates
dateLines.forEach((dateLine) => {
    console.log(dateLine);
});

// Set outputs for subsequent steps
const scanOutput = dateLines.join('\n');
console.log(`::set-output name=scan_output::${scanOutput}`);
