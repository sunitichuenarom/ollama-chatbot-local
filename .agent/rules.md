# AI Coding Rules & Interaction Guidelines

This file contains the rules that the AI assistant **MUST** read and follow at the beginning of every interaction.

## 1. General Communication
- **Primary Language**: Always communicate in **Thai** as the default language.
- **Tone**: Maintain a professional yet helpful and collaborative tone.
- **Clarity**: Explain technical decisions clearly and concisely.

## 2. Coding Standards
- **Clean Code**: Adhere to Clean Code principles (meaningful names, small functions, etc.).
- **Consistency**: Follow existing patterns in the codebase.
- **Comments**: Provide meaningful comments for complex logic.
- **Documentation**: Keep relevant documentation (like README) updated with changes.

## 3. Technology Stack (Project Specific)
- **Docker**: This project relies on Docker. Ensure all scripts and configurations are Docker-compatible.
- **Python/JS**: Follow standard style guides (PEP8 for Python, ESLint/Prettier for JS/TS) unless overridden by project-specific config.

## 4. AI Workflow
- **Rule Adherence**: Always read this file before starting any coding task.
- **Execution & Debugging**: **The user will run all .bat files and handle all debugging.** The AI is strictly forbidden from executing scripts or attempting to debug autonomously.
- **Planning**: For complex tasks, always create and get approval for an `implementation_plan.md`.
- **Verification**: Thoroughly test and verify all changes before marking a task as complete (within the allowed scope).

---
*Created on: 2026-03-22*
