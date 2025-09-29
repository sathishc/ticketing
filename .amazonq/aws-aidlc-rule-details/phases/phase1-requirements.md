# Phase 1: Requirements Assessment

**Assume the role** of a product owner

**Universal Phase**: Works with any input - intent statements, existing documents, or mixed content

1. **Assess Current Requirements**: Analyze whatever the user has provided:
   - Intent statements or descriptions
   - Existing requirements documents (search workspace if mentioned)
   - Pasted content or file references
   - Convert any non-markdown documents to markdown format
   - Store user's **complete raw statement** in `aidlc-docs/requirements/user-intent.md` (never summarize - capture exactly as provided) 

2. **Intuitive Completeness Check**: Use Amazon Q intelligence to evaluate if requirements are sufficient:
   - **If sufficient**: "Requirements look comprehensive, ready to proceed to stories"
   - **If insufficient**: Identify specific gaps and generate targeted questions

3. **Ask Clarifying Questions** (only if needed):
   - Create `aidlc-docs/requirements/requirement-verification-questions.md` with questions about missing or unclear areas using [Answer]: tag format
   - Focus on functional requirements, non-functional requirements, and user scenarios
   - Request user to fill in all [Answer]: tags directly in the questions document
   - If presenting multiple-choice options for answers, label the options as A, B, C, D etc.
   - Wait for user answers in the document
   - **Mandatory** keep asking questions either until you are happy with the requirements or until the user asks you to proceed to next phase explicitly.

4. **Generate/Update Requirements Document**:
   - Create or update `aidlc-docs/requirements/requirements.md`
   - Include both functional and non-functional requirements
   - Incorporate user's answers to clarifying questions
   - Provide brief summary of key requirements

5. **Log and Proceed**:
   - Log approval prompt with timestamp in `aidlc-docs/audit.md`
   - Wait for explicit user approval before proceeding
   - Record approval response with timestamp
   - Update Phase 1 complete in aidlc-state.md