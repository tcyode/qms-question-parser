/**
 * @fileoverview Integration tests for Sheets Integration
 * @author [Your Name]
 * @version 1.0.0
 */

const SheetsIntegration = require('../../integration/sheetsIntegration');
const QuestionParser = require('../../parsing/questionParser');
const SheetHandler = require('../../handlers/sheetHandler');

// Mock Google Apps Script services
jest.mock('../../handlers/sheetHandler');

describe('Sheets Integration', () => {
    let integration;
    let mockSheetHandler;

    // Test data
    const TEST_INPUT = {
        singleQuestion: "Day 1 Lois - Questions Question #1 What are the 4 main banking transactions?",
        multipleQuestions: "Day 1 Lois - Questions Question #1 What are the 4 main banking transactions? Question #2 What are the 3 primary reports?",
        questionWithImage: "Day 27 Tye Question #1: For the attached, What are potential problems?\nhttps://drive.google.com/file/example"
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Initialize integration with mocked dependencies
        integration = new SheetsIntegration();
        mockSheetHandler = SheetHandler.mock.instances[0];
    });

    describe('processNewQuestion', () => {
        test('should process single question successfully', () => {
            // Setup mock returns
            mockSheetHandler.logToRawData.mockReturnValue(true);
            mockSheetHandler.writeToQuestionBank.mockReturnValue(true);

            // Process question
            const result = integration.processNewQuestion(TEST_INPUT.singleQuestion);

            // Verify result
            expect(result.success).toBe(true);
            expect(result.questionId).toBeDefined();
            expect(mockSheetHandler.logToRawData).toHaveBeenCalledWith(TEST_INPUT.singleQuestion);
            expect(mockSheetHandler.writeToQuestionBank).toHaveBeenCalled();
        });

        test('should handle processing errors gracefully', () => {
            // Setup mock to simulate error
            mockSheetHandler.writeToQuestionBank.mockReturnValue(false);

            // Process question
            const result = integration.processNewQuestion(TEST_INPUT.singleQuestion);

            // Verify error handling
            expect(result.success).toBe(false);
            expect(result.message).toContain('Failed to process');
        });
    });

    describe('processMultipleQuestions', () => {
        test('should process multiple questions successfully', () => {
            // Setup mocks
            mockSheetHandler.logToRawData.mockReturnValue(true);
            mockSheetHandler.writeToQuestionBank.mockReturnValue(true);

            // Process questions
            const result = integration.processMultipleQuestions(TEST_INPUT.multipleQuestions);

            // Verify results
            expect(result.success).toBe(true);
            expect(result.results).toHaveLength(2);
            expect(mockSheetHandler.writeToQuestionBank).toHaveBeenCalledTimes(2);
        });

        test('should handle partial failures in multiple questions', () => {
            // Setup mock to fail on second question
            mockSheetHandler.writeToQuestionBank
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);

            // Process questions
            const result = integration.processMultipleQuestions(TEST_INPUT.multipleQuestions);

            // Verify partial failure handling
            expect(result.success).toBe(false);
            expect(result.results).toContainEqual(expect.objectContaining({ success: false }));
        });
    });

    describe('updateExistingQuestion', () => {
        const questionId = 'S1-D01-Q01-A02';

        test('should update question successfully', () => {
            // Setup mock
            mockSheetHandler.updateQuestion.mockReturnValue(true);

            // Update question
            const result = integration.updateExistingQuestion(questionId, TEST_INPUT.singleQuestion);

            // Verify update
            expect(result.success).toBe(true);
            expect(result.questionId).toBe(questionId);
            expect(mockSheetHandler.updateQuestion).toHaveBeenCalled();
        });

        test('should handle update failures', () => {
            // Setup mock to fail
            mockSheetHandler.updateQuestion.mockReturnValue(false);

            // Attempt update
            const result = integration.updateExistingQuestion(questionId, TEST_INPUT.singleQuestion);

            // Verify failure handling
            expect(result.success).toBe(false);
            expect(result.message).toContain('Failed to update');
        });
    });

    describe('getProcessedQuestions', () => {
        const mockQuestions = [
            { questionId: 'Q1', topic: 'QBO' },
            { questionId: 'Q2', topic: 'PBS' }
        ];

        test('should retrieve questions with filters', () => {
            // Setup mock
            mockSheetHandler.getAllQuestions.mockReturnValue(mockQuestions);

            // Get filtered questions
            const result = integration.getProcessedQuestions({ topic: 'QBO' });

            // Verify filtering
            expect(result).toHaveLength(1);
            expect(result[0].topic).toBe('QBO');
        });

        test('should handle retrieval errors', () => {
            // Setup mock to simulate error
            mockSheetHandler.getAllQuestions.mockImplementation(() => {
                throw new Error('Sheet error');
            });

            // Attempt retrieval
            const result = integration.getProcessedQuestions();

            // Verify error handling
            expect(result).toEqual([]);
        });
    });
});