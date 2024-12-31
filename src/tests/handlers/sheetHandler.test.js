/**
 * @fileoverview Tests for Sheet Operations
 * @author [Your Name]
 * @version 1.0.0
 */

const SheetHandler = require('../../handlers/sheetHandler');
const SHEET_CONFIG = require('../../config/sheetsConfig');

describe('SheetHandler', () => {
    let sheetHandler;
    let mockSheet;
    
    // Test data
    const TEST_DATA = {
        singleQuestion: {
            questionId: 'S1-D01-Q01-A01',
            question: 'Test Question?',
            topic: 'QBO',
            hasImage: false,
            author: 'Author1'
        },
        sheetData: [
            ['Question ID', 'Question', 'Context', 'HasImage', 'ImageURL', 'Topic', 'Author'],
            ['S1-D01-Q01-A01', 'Question 1?', '', 'No', '', 'QBO', 'Author1'],
            ['S1-D01-Q02-A02', 'Question 2?', '', 'No', '', 'QBO', 'Author2']
        ],
        rawInput: "Day 1 Test Question"
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock sheet
        mockSheet = {
            appendRow: jest.fn(),
            getRange: jest.fn().mockReturnThis(),
            getValues: jest.fn().mockReturnValue(TEST_DATA.sheetData),
            getDataRange: jest.fn().mockReturnThis(),
            setValues: jest.fn(),
            setValue: jest.fn(),
            getLastRow: jest.fn().mockReturnValue(3),
            getLastColumn: jest.fn().mockReturnValue(7),
            clear: jest.fn(),
            deleteRow: jest.fn()
        };

        // Setup mock spreadsheet
        global.SpreadsheetApp = {
            getActiveSpreadsheet: jest.fn().mockReturnValue({
                getSheetByName: jest.fn().mockReturnValue(mockSheet)
            })
        };

        // Initialize handler
        sheetHandler = new SheetHandler();
    });

    describe('Basic Operations', () => {
        test('should initialize correctly', () => {
            expect(sheetHandler).toBeDefined();
            expect(SpreadsheetApp.getActiveSpreadsheet).toHaveBeenCalled();
        });

        test('should get sheet by name', () => {
            const sheet = sheetHandler.getSheet(SHEET_CONFIG.SHEETS.QUESTION_BANK);
            expect(sheet).toBeDefined();
            expect(SpreadsheetApp.getActiveSpreadsheet().getSheetByName).toHaveBeenCalledWith(SHEET_CONFIG.SHEETS.QUESTION_BANK);
        });
    });

    describe('Write Operations', () => {
        test('should write question to question bank', () => {
            const result = sheetHandler.writeToQuestionBank(TEST_DATA.singleQuestion);
            expect(result).toBe(true);
            expect(mockSheet.appendRow).toHaveBeenCalled();
        });

        test('should log raw data', () => {
            const result = sheetHandler.logToRawData(TEST_DATA.rawInput);
            expect(result).toBe(true);
            expect(mockSheet.appendRow).toHaveBeenCalled();
        });
    });

    describe('Read Operations', () => {
        test('should get all questions', () => {
            const questions = sheetHandler.getAllQuestions();
            expect(questions).toHaveLength(2); // Excluding header row
            expect(questions[0]['Question ID']).toBe('S1-D01-Q01-A01');
        });

        test('should handle empty sheet', () => {
            mockSheet.getValues.mockReturnValue([['Question ID', 'Question']]);
            const questions = sheetHandler.getAllQuestions();
            expect(questions).toHaveLength(0);
        });
    });

    describe('Validation Methods', () => {
        test('should validate correct question ID format', () => {
            const validQuestion = {
                questionId: 'S1-D01-Q01-A01',
                question: 'Valid Question?',
                topic: 'QBO'
            };
            const result = sheetHandler.writeToQuestionBank(validQuestion);
            expect(result).toBe(true);
        });

        test('should reject invalid question ID format', () => {
            const invalidQuestion = {
                questionId: 'INVALID-ID',
                question: 'Valid Question?',
                topic: 'QBO'
            };
            const result = sheetHandler.writeToQuestionBank(invalidQuestion);
            expect(result).toBe(false);
        });
    });

    describe('Range Operations', () => {
        test('should handle invalid range parameters', () => {
            const result = sheetHandler.writeRange(
                SHEET_CONFIG.SHEETS.QUESTION_BANK, 
                [], 
                -1, 
                0
            );
            expect(result).toBe(false);
        });

        test('should handle range exceeding sheet bounds', () => {
            mockSheet.getLastRow.mockReturnValue(1000);
            mockSheet.getLastColumn.mockReturnValue(10);
            
            const largeData = Array(2000).fill(['test']);
            const result = sheetHandler.writeRange(
                SHEET_CONFIG.SHEETS.QUESTION_BANK,
                largeData,
                1,
                1
            );
            expect(result).toBe(false);
        });

        test('should handle valid range parameters', () => {
            const validData = [['test1', 'test2'], ['test3', 'test4']];
            const result = sheetHandler.writeRange(
                SHEET_CONFIG.SHEETS.QUESTION_BANK,
                validData,
                1,
                1
            );
            expect(result).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should handle sheet not found', () => {
            global.SpreadsheetApp.getActiveSpreadsheet.mockReturnValue({
                getSheetByName: jest.fn().mockReturnValue(null)
            });
            const result = sheetHandler.writeToQuestionBank(TEST_DATA.singleQuestion);
            expect(result).toBe(false);
        });

        test('should handle permission errors', () => {
            mockSheet.appendRow.mockImplementation(() => {
                throw new Error('Permission denied');
            });
            const result = sheetHandler.writeToQuestionBank(TEST_DATA.singleQuestion);
            expect(result).toBe(false);
        });

        test('should handle quota exceeded errors', () => {
            mockSheet.getValues.mockImplementation(() => {
                throw new Error('Quota exceeded');
            });
            const result = sheetHandler.getAllQuestions();
            expect(result).toEqual([]);
        });
    });

    describe('Edge Cases', () => {
        test('should handle sheet name with special characters', () => {
            const result = sheetHandler.getSheet('Sheet!@#$%^&*()');
            expect(result).toBe(null);
        });

        test('should handle maximum row count', () => {
            mockSheet.getLastRow.mockReturnValue(1000000);
            const result = sheetHandler.appendRow(
                SHEET_CONFIG.SHEETS.QUESTION_BANK,
                ['test']
            );
            expect(result).toBe(false);
        });

        test('should handle sheet at maximum capacity', () => {
            mockSheet.getLastRow.mockReturnValue(1000000);
            const result = sheetHandler.writeToQuestionBank(TEST_DATA.singleQuestion);
            expect(result).toBe(false);
        });
    });
});