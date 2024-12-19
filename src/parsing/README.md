# Parsing Functions 📝

## Purpose
Contains functions for parsing Discord messages into structured data.

💡 This folder handles all the logic for taking raw Discord text and turning it into structured data. Think of it as the "translator" of your application!
**`parsing/` = Input processing**

Think of this like a translator 🔄
- Input: Raw Discord messages like "Day 1 Question #3..."
- Process: Breaks down the text into pieces
- Output: Structured data (question ID, author, date, etc.)

Example: Like taking a messy handwritten form and converting it into a neat spreadsheet  
In YOUR Project: `parsing/`: Processes Discord messages into questions

## Main Functions
- Question extraction
- Author detection
- Date parsing
- Image link handling

## File Structure
- `questionParser.js`: Core parsing logic
- `validator.js`: Input validation
- `formatter.js`: Output formatting
