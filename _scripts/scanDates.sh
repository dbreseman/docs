#!/bin/bash

# Define regex pattern to match dates in the format "Month Day, Year"
DATE_PATTERN="\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+[0-9]{1,2},\s+[0-9]{4}\b"

# Get the start date and end date for the upcoming month
START_DATE=$(date -d "next month" +%Y%m01)
END_DATE=$(date -d "next month +1 month -1 day" +%Y%m%d)

# Function to recursively search for dates in Markdown files
scan_files_for_dates() {
    local DIRECTORY="$1"
    local DATE_LINES=()

    # Recursive function to search for dates
    search_for_dates() {
        local DIRECTORY="$1"
        local FILES=$(find "$DIRECTORY" -type f -name "*.md")

        for FILE in $FILES; do
            while IFS= read -r LINE; do
                if [[ $LINE =~ $DATE_PATTERN ]]; then
                    DATE=$(awk -v date="${BASH_REMATCH[0]}" 'BEGIN { print mktime(date); }')
                    if [[ $DATE -ge $START_DATE && $DATE -le $END_DATE ]]; then
                        DATE_LINES+=("$FILE:$LINE")
                    fi
                fi
            done < "$FILE"
        done
    }

    search_for_dates "$DIRECTORY"
    printf '%s\n' "${DATE_LINES[@]}"
}

# Scan files for dates in the specified directory
scan_files_for_dates "content/en/docs"
