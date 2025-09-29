# Phase 4: Architectural Decision - Detailed Steps

## Step-by-Step Execution

### 1. Analyze Context
- Read `aidlc-docs/requirements/requirements.md` and `aidlc-docs/user-stories/stories.md`
- Identify potential independently deployable components and natural boundaries
- Determine architecture patterns and deployment concerns specific to this use case

### 2. Generate Dynamic Questions
- Create targeted questions based on the analysis above
- Focus only on decisions relevant to the identified architecture patterns
- Generate questions about deployment boundaries, team structure, and operational complexity

### 3. Create Decision Document
- Create `aidlc-docs/design/architectural-decisions.md` with:
  - Analysis summary of identified components
  - AI-generated use case-specific questions with [Answer]: tags
- Present document to user for completion

### 4. Process Responses with Mandatory Follow-ups
- **MANDATORY ANSWER ANALYSIS**: Review all answers for vague responses ("mix of", "not sure", "depends on"), undefined criteria, contradictions, or incomplete reasoning
- **CRITICAL**: Add follow-up questions to document using [Answer]: tags for ANY unclear answers
- **DO NOT proceed unless user explicitly states "I want to proceed with this decision" or "override and continue"**

### 5. Finalize and Log
- Document final decision, rationale, and any overrides in architectural-decisions.md
- Log decision and any follow-ups in `aidlc-docs/audit.md` with timestamp
- Update `aidlc-state.md` to mark Phase 4 complete
- Proceed to Phase 5: Unit Planning