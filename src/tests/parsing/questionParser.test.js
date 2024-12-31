/**
 * @fileoverview Unit tests for question parser functionality
 */

const { parseQuestion, parseQuestions, formatQuestionId } = require('../../parsing/questionParser');

// Constants
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

// Test Cases
const TEST_CASES = {
    // Basic Case
    basicQuestion: {
        input: "Day 1 Lois - Questions Question #1 What are the 4 main banking transactions?",
        expected: {
            questionId: "S1-D01-Q01-A02",
            question: "What are the 4 main banking transactions?",
            topic: "QBO"
        }
    },

    // Edge Cases
    edgeCase1: {
        input: "Day 27 Tye Question #2: For the attached, when you see two vendors with similar names, What are steps you can take to resolve this potential problem?",
        expected: {
            questionId: "S1-D27-Q02-A01",
            hasImage: true,
            context: "For the attached, when you see two vendors with similar names",
            question: "What are steps you can take to resolve this potential problem?",
            topic: "QBO"
        }
    },

    edgeCase2: {
        input: "Day 27 Tye Question #3: What do we do whenever we come across these? (edited)",
        expected: {
            questionId: "S1-D27-Q03-A01",
            question: "What do we do whenever we come across these?",
            isEdited: true,
            topic: "QBO"
        }
    },

    // Multiple Questions
    multipleQuestions: {
        input: "Day 1 Lois - Questions Question #1 What are the 4 main banking transactions? Question #2 What are the 3 primary reports?",
        expected: [
            {
                questionId: "S1-D01-Q01-A02",
                question: "What are the 4 main banking transactions?",
                topic: "QBO"
            },
            {
                questionId: "S1-D01-Q02-A02",
                question: "What are the 3 primary reports?",
                topic: "QBO"
            }
        ]
    },

    // Question with Image
    questionWithImage: {
        input: "Day 27 Tye Question #1: For the attached, What are potential problems?\nhttps://drive.google.com/file/example",
        expected: {
            questionId: "S1-D27-Q01-A01",
            question: "What are potential problems?",
            hasImage: true,
            context: "For the attached",
            imageUrl: "https://drive.google.com/file/example",
            topic: "QBO"
        }
    }
};

// Test Suites
describe('Question Parser', () => {
    // Test ID Formatting
    describe('ID Formatting', () => {
        test('should format question ID correctly', () => {
            const result = formatQuestionId('1', '27', '1', 'Lois_Eleven');
            expect(result).toBe('S1-D27-Q01-A02');
        });
    });

    // Test Basic Parsing
    describe('Basic Parsing', () => {
        test('should parse basic question format', () => {
            const result = parseQuestion(TEST_CASES.basicQuestion.input);
            expect(result).toEqual(TEST_CASES.basicQuestion.expected);
        });
    });

    // Test Edge Cases
    describe('Edge Cases', () => {
        test('should handle question with context and image', () => {
            const result = parseQuestion(TEST_CASES.edgeCase1.input);
            expect(result).toEqual(TEST_CASES.edgeCase1.expected);
        });

        test('should handle edited questions', () => {
            const result = parseQuestion(TEST_CASES.edgeCase2.input);
            expect(result).toEqual(TEST_CASES.edgeCase2.expected);
        });
    });

    // Test Multiple Questions
    describe('Multiple Questions', () => {
        test('should parse multiple questions in one message', () => {
            const results = parseQuestions(TEST_CASES.multipleQuestions.input);
            expect(results).toEqual(TEST_CASES.multipleQuestions.expected);
        });
    });

    // Test Image Handling
    describe('Image Handling', () => {
        test('should handle questions with image attachments', () => {
            const result = parseQuestion(TEST_CASES.questionWithImage.input);
            expect(result).toEqual(TEST_CASES.questionWithImage.expected);
        });
    });
});