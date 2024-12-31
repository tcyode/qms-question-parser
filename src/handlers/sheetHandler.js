/**
 * @fileoverview Sheet Operations Handler for QMS
 * @author [Your Name]
 * @version 1.0.0
 */
// ✨ CORRECT import
const SHEET_CONFIG = require('../config/sheetsConfig');
/**
 * Handles all Google Sheets operations
 */
class SheetHandler {
    /**
     * Initialize the handler with active spreadsheet
     */
    constructor() {
        this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }

    // 🆕 NEW: Added validation methods
    /**
     * Validate question data
     * @param {Object} question - Question data to validate
     * @returns {boolean} Is valid
     * @private
     */
    _validateQuestion(question) {
        if (!question || typeof question !== 'object') return false;

        const requiredFields = ['questionId', 'question', 'topic'];
        if (!requiredFields.every(field => question[field])) return false;

        const idPattern = /^S\d+-D\d{2}-Q\d{2}-A\d{2}$/;
        if (!idPattern.test(question.questionId)) return false;

        return true;
    }

    // 🆕 NEW: Added sheet name validation
    /**
     * Validate sheet name
     * @param {string} sheetName - Name to validate
     * @returns {boolean} Is valid
     * @private
     */
    _validateSheetName(sheetName) {
        const invalidChars = /[!@#$%^&*()]/;
        return !invalidChars.test(sheetName);
    }

    // 🆕 NEW: Added space validation
    /**
     * Check if sheet has reached maximum rows
     * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Sheet to check
     * @returns {boolean} Has space available
     * @private
     */
    _hasAvailableSpace(sheet) {
        const MAX_ROWS = 1000000;
        return sheet.getLastRow() < MAX_ROWS;
    }

    // 📝 MODIFIED: Updated getSheet with validation
    /**
     * Get sheet by name
     * @param {string} sheetName - Name of sheet
     * @returns {GoogleAppsScript.Spreadsheet.Sheet} Sheet object
     * @throws {Error} If sheet not found
     */
    getSheet(sheetName) {
        if (!this._validateSheetName(sheetName)) {
            return null;
        }

        const sheet = this.spreadsheet.getSheetByName(sheetName);
        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }
        return sheet;
    }

    // 📝 MODIFIED: Updated writeToQuestionBank with validation
    /**
     * Write parsed question to Question Bank
     * @param {Object} parsedQuestion - The parsed question object
     * @returns {boolean} Success status
     */
    writeToQuestionBank(parsedQuestion) {
        try {
            if (!this._validateQuestion(parsedQuestion)) {
                return false;
            }

            const sheet = this.getSheet(SHEET_CONFIG.SHEETS.QUESTION_BANK);
            if (!this._hasAvailableSpace(sheet)) {
                return false;
            }

            const row = [
                parsedQuestion.questionId,
                parsedQuestion.question,
                parsedQuestion.context || '',
                parsedQuestion.hasImage ? 'Yes' : 'No',
                parsedQuestion.imageUrl || '',
                parsedQuestion.topic,
                parsedQuestion.author || '',
                new Date().toISOString(),
                parsedQuestion.isEdited ? 'Yes' : 'No'
            ];
            
            sheet.appendRow(row);
            return true;
        } catch (error) {
            Logger.log(`Error writing to Question Bank: ${error.message}`);
            return false;
        }
    }

    // No changes to logToRawData
    logToRawData(rawInput) {
        // ... existing implementation ...
    }

    // No changes to getSheetData
    getSheetData(sheetName) {
        // ... existing implementation ...
    }

    // No changes to findRowById
    findRowById(sheetName, id, idColumn = 0) {
        // ... existing implementation ...
    }

    // 📝 MODIFIED: Updated appendRow with space validation
    /**
     * Append row to specified sheet
     * @param {string} sheetName - Name of sheet
     * @param {Array} rowData - Array of values to write
     * @returns {boolean} Success status
     */
    appendRow(sheetName, rowData) {
        try {
            const sheet = this.getSheet(sheetName);
            if (!sheet || !this._hasAvailableSpace(sheet)) {
                return false;
            }
            sheet.appendRow(rowData);
            return true;
        } catch (error) {
            Logger.log(`Error appending row: ${error.message}`);
            return false;
        }
    }

    // 📝 MODIFIED: Updated writeRange with bounds checking
    /**
     * Write data to specific range
     * @param {string} sheetName - Name of sheet
     * @param {Array<Array>} data - 2D array of data
     * @param {number} startRow - Starting row (1-based)
     * @param {number} startCol - Starting column (1-based)
     * @returns {boolean} Success status
     */
    writeRange(sheetName, data, startRow, startCol) {
        try {
            if (!Array.isArray(data) || !data.length || startRow < 1 || startCol < 1) {
                return false;
            }

            const sheet = this.getSheet(sheetName);
            if (!sheet) return false;

            // Check if range exceeds sheet bounds
            const lastRow = sheet.getLastRow();
            const lastCol = sheet.getLastColumn();
            if (startRow + data.length > lastRow + 1000 || 
                startCol + data[0].length > lastCol + 26) {
                return false;
            }

            const range = sheet.getRange(
                startRow, 
                startCol, 
                data.length, 
                data[0].length
            );
            range.setValues(data);
            return true;
        } catch (error) {
            Logger.log(`Error writing range: ${error.message}`);
            return false;
        }
    }

    // No changes to remaining methods
    updateQuestion(questionId, updatedData) {
        // ... existing implementation ...
    }

    updateCell(sheetName, row, col, value) {
        // ... existing implementation ...
    }

    updateRow(sheetName, row, rowData) {
        // ... existing implementation ...
    }

    deleteRow(sheetName, row) {
        // ... existing implementation ...
    }

    clearSheet(sheetName, keepHeader = true) {
        // ... existing implementation ...
    }

    getAllQuestions() {
        // ... existing implementation ...
    }
}

module.exports = SheetHandler;
