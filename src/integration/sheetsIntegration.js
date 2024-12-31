/**
 * @fileoverview Integration layer between Parser and Google Sheets
 * @author [Your Name]
 * @version 1.0.0
 */

const QuestionParser = require('../parsing/questionParser');
const SheetHandler = require('../handlers/sheetHandler');
const SHEET_CONFIG = require('../config/sheetsConfig');

/**
 * Handles integration between parsing and sheet operations
 */
class SheetsIntegration {
    /**
     * Initialize integration with parser and sheet handler
     */
    constructor() {
        // Remove the new QuestionParser() line
        this.parser = { parseQuestion, parseQuestions }; // Use functions directly
        this.sheetHandler = new SheetHandler();
    }

    /**
     * Process new question input
     * @param {string} rawInput - Raw question text from Discord
     * @returns {Object} Processing result
     */
    processNewQuestion(rawInput) {
        try {
            // Log raw input first
            this.sheetHandler.logToRawData(rawInput);

            // Parse the question
            const parsedQuestion = this.parser.parseQuestion(rawInput);

            // Write to question bank
            const success = this.sheetHandler.writeToQuestionBank(parsedQuestion);

            return {
                success,
                questionId: parsedQuestion.questionId,
                message: success ? 'Question processed successfully' : 'Failed to process question'
            };
        } catch (error) {
            Logger.log(`Error processing question: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Error processing question'
            };
        }
    }

    /**
     * Process multiple questions from one input
     * @param {string} rawInput - Raw text containing multiple questions
     * @returns {Object} Processing results
     */
    processMultipleQuestions(rawInput) {
        try {
            // Log raw input
            this.sheetHandler.logToRawData(rawInput);

            // Parse multiple questions
            const parsedQuestions = this.parser.parseQuestions(rawInput);

            // Track results
            const results = parsedQuestions.map(question => {
                const success = this.sheetHandler.writeToQuestionBank(question);
                return {
                    success,
                    questionId: question.questionId
                };
            });

            return {
                success: results.every(r => r.success),
                results,
                message: `Processed ${results.length} questions`
            };
        } catch (error) {
            Logger.log(`Error processing multiple questions: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Error processing multiple questions'
            };
        }
    }

    /**
     * Update existing question
     * @param {string} questionId - ID of question to update
     * @param {string} newInput - New question text
     * @returns {Object} Update result
     */
    updateExistingQuestion(questionId, newInput) {
        try {
            // Parse new input
            const parsedQuestion = this.parser.parseQuestion(newInput);
            
            // Preserve questionId
            parsedQuestion.questionId = questionId;
            parsedQuestion.isEdited = true;

            // Update in sheet
            const success = this.sheetHandler.updateQuestion(questionId, parsedQuestion);

            return {
                success,
                questionId,
                message: success ? 'Question updated successfully' : 'Failed to update question'
            };
        } catch (error) {
            Logger.log(`Error updating question: ${error.message}`);
            return {
                success: false,
                error: error.message,
                message: 'Error updating question'
            };
        }
    }

    /**
     * Get processed questions
     * @param {Object} filters - Optional filters for questions
     * @returns {Array<Object>} Array of questions
     */
    getProcessedQuestions(filters = {}) {
        try {
            const questions = this.sheetHandler.getAllQuestions();
            
            // Apply filters if any
            if (Object.keys(filters).length > 0) {
                return questions.filter(question => {
                    return Object.entries(filters).every(([key, value]) => 
                        question[key] === value
                    );
                });
            }

            return questions;
        } catch (error) {
            Logger.log(`Error getting questions: ${error.message}`);
            return [];
        }
    }
}

module.exports = SheetsIntegration;