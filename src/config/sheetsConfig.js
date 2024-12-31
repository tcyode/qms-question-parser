/**
 * @fileoverview Google Sheets configuration for QMS
 * @author [Your Name]
 * @version 1.0.0
 */

const SHEET_CONFIG = {
    // Sheet Names
    SHEETS: {
        RAW_DATA: 'Raw Data',
        ADMIN_LOG: 'Admin Log',
        IMAGE_LIBRARY: 'Image Library',
        PARSING_RESULTS: 'Parsing Results',
        QUESTION_BANK: 'Question Bank',
        MY_QUESTIONS: 'My Questions',
        MY_RESPONSES: 'My Responses',
        MY_PROGRESS: 'My Progress',
        CURRENT_WEEK: 'Current Week Questions',
        TEAM_PROGRESS: 'Team Progress'
    },

    // Column Mappings
    COLUMNS: {
        // Question Bank Columns
        QUESTION_ID: 'A',
        QUESTION_TEXT: 'B',
        CONTEXT: 'C',
        HAS_IMAGE: 'D',
        IMAGE_URL: 'E',
        TOPIC: 'F',
        AUTHOR: 'G',
        DATE_ADDED: 'H',
        IS_EDITED: 'I'
    },

    // Header Rows
    HEADERS: {
        QUESTION_BANK: [
            'Question ID',
            'Question',
            'Context',
            'Has Image',
            'Image URL',
            'Topic',
            'Author',
            'Date Added',
            'Is Edited'
        ]
    }
};

module.exports = SHEET_CONFIG;