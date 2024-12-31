/**
 * @fileoverview Question Parser Implementation
 * @author Tye Kirk
 * @version 1.0.0
 */

/**
 * Formats a question ID based on set parameters
 * @param {string} set - The set number
 * @param {string} day - The day number
 * @param {string} questionNum - The question number
 * @param {string} author - The author name
 * @returns {string} Formatted question ID
 */
function formatQuestionId(set, day, questionNum, author) {
    const ID_FORMAT = {
        QUESTION: {
            PREFIX: 'S1',
            SEPARATOR: '-',
            AUTHOR_CODES: {
                'Lois_Eleven': 'A02',
                'RedcreatesTye': 'A01'
            }
        }
    };

    const paddedDay = day.toString().padStart(2, '0');
    const paddedQuestion = questionNum.toString().padStart(2, '0');
    const authorCode = ID_FORMAT.QUESTION.AUTHOR_CODES[author] || 'A00';

    return [
        ID_FORMAT.QUESTION.PREFIX,
        `D${paddedDay}`,
        `Q${paddedQuestion}`,
        authorCode
    ].join(ID_FORMAT.QUESTION.SEPARATOR);
}

/**
 * Extracts day number from input text
 * @param {string} input - Input text
 * @returns {string} Day number
 */
function extractDay(input) {
    const dayMatch = input.match(/Day (\d+)/);
    return dayMatch ? dayMatch[1] : '00';
}

/**
 * Extracts author from input text
 * @param {string} input - Input text
 * @returns {string} Author name
 */
function extractAuthor(input) {
    if (input.includes('Lois')) return 'Lois_Eleven';
    if (input.includes('Tye')) return 'RedcreatesTye';
    return 'Unknown';
}

/**
 * Extracts question number from input text
 * @param {string} input - Input text
 * @returns {string} Question number
 */
function extractQuestionNumber(input) {
    const questionMatch = input.match(/Question #(\d+)/i);
    return questionMatch ? questionMatch[1] : '00';
}

/**
 * Parses a single question from input text
 * @param {string} input - The input text to parse
 * @returns {Object} Parsed question object
 */
function parseQuestion(input) {
    const day = extractDay(input);
    const author = extractAuthor(input);
    const questionNum = extractQuestionNumber(input);
    const questionId = formatQuestionId('1', day, questionNum, author);
    
    const result = {
        questionId,
        topic: "QBO"
    };

    if (input.includes('(edited)')) {
        result.isEdited = true;
        input = input.replace(/\s*\(edited\)\s*/, ' ');
    }

    // Extract image URL first
    const urlMatch = input.match(/(https:\/\/drive\.google\.com\/[^\s]+)/);
    if (urlMatch) {
        result.imageUrl = urlMatch[1];
        result.hasImage = true;
    }

    const questionTextMatch = input.match(/Question #\d+:?\s*(.+?)(?:\?|$)/);
    if (questionTextMatch) {
        let fullText = questionTextMatch[1].trim();

        // Handle "For the attached" context
        if (fullText.startsWith('For the attached')) {
            result.hasImage = true;
            
            // Find the last comma before a question word
            const questionWordMatch = fullText.match(/(.*),\s*(What|How|Why|When|Where)/i);
            if (questionWordMatch) {
                result.context = questionWordMatch[1].trim();
                result.question = questionWordMatch[2] + ' ' + fullText.slice(questionWordMatch[0].length + 1);
            } else {
                // Fallback to simple comma split
                const parts = fullText.split(/,\s*(.*)/);
                if (parts.length > 1) {
                    result.context = parts[0].trim();
                    result.question = parts[1].trim();
                } else {
                    result.question = fullText;
                }
            }
        } else {
            result.question = fullText;
        }

        // Ensure question ends with question mark
        if (!result.question.endsWith('?')) {
            result.question += '?';
        }
    }

    // Set hasImage if we have context but no flag yet
    if (result.context && !result.hasImage) {
        result.hasImage = true;
    }

    return result;
}

/**
 * Parses multiple questions from input text
 * @param {string} input - The input text to parse
 * @returns {Array<Object>} Array of parsed question objects
 */
function parseQuestions(input) {
    // Extract common information
    const day = extractDay(input);
    const author = extractAuthor(input);
    
    // Match all questions with their numbers and text
    const questionRegex = /Question #(\d+)\s*([^?]+\?)/g;
    const questions = [];
    let match;

    while ((match = questionRegex.exec(input)) !== null) {
        const questionNum = match[1];
        const questionText = match[2].trim();
        
        // Create a proper question string with day and author
        const fullQuestion = `Day ${day} ${author} Question #${questionNum} ${questionText}`;
        questions.push(parseQuestion(fullQuestion));
    }

    return questions;
}

module.exports = {
    parseQuestion,
    parseQuestions,
    formatQuestionId
};