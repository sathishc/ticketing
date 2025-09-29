# Phase 9: Per-Unit NFR Planning

## Overview
Plan NFR and setup decisions for each unit of work. Each team can make independent decisions about their unit's technology stack and deployment approach.

## Steps to Execute

### Step 1: Create Unit NFR Planning Questions
- [ ] Generate questions about unit-specific performance requirements
- [ ] Generate questions about unit scalability needs
- [ ] Generate questions about unit security requirements
- [ ] Generate questions about unit deployment preferences
- [ ] Generate questions about unit monitoring and logging
- [ ] Generate questions about unit data persistence
- [ ] Generate questions about unit external integrations
- [ ] Generate questions about organizational constraints for this unit

### Step 2: Unit Technology Stack Planning
- [ ] Ask about preferred programming language/framework for this unit
- [ ] Ask about database preferences for this unit
- [ ] Ask about deployment platform for this unit (can differ from other units)
- [ ] Ask about CI/CD preferences for this unit
- [ ] Ask about testing framework preferences for this unit

### Step 3: Create Unit NFR Plan Document
- [ ] Document all unit NFR questions with [Answer]: tags
- [ ] Include unit-specific organizational setup questions
- [ ] Include unit technology stack decisions
- [ ] Include unit deployment strategy questions
- [ ] **MANDATORY**: Include setup execution steps based on NFR answers:
  - [ ] Setup unit project structure
  - [ ] Configure unit technology stack
  - [ ] Configure unit deployment infrastructure
  - [ ] Implement unit organizational setup
  - [ ] Create unit base application structure
  - [ ] Validate unit setup is working
- [ ] Save as `aidlc-docs/plans/{unit-name}-nfr-setup-plan.md`

### Step 4: ANALYZE ANSWERS (MANDATORY)
Before proceeding, you MUST carefully review all user answers for:
- **Vague or ambiguous responses**: "mix of", "somewhere between", "not sure", "depends"
- **Undefined criteria or terms**: References to concepts without clear definitions
- **Contradictory answers**: Responses that conflict with each other
- **Missing generation details**: Answers that lack specific guidance
- **Answers that combine options**: Responses that merge different approaches without clear decision rules

### Step 5: MANDATORY Follow-up Questions
If the analysis reveals ANY ambiguous answers, you MUST:
- Add specific follow-up questions to the plan document using [Answer]: tags
- DO NOT proceed to approval until all ambiguities are resolved

### Step 6: Log Approval Prompt
- [ ] Before asking for approval, log the prompt with timestamp in `aidlc-docs/audit.md`
- [ ] Include reference to unit NFR planning completion
- [ ] Use ISO 8601 timestamp format

### Step 7: Wait for Explicit Approval
- [ ] Do not proceed until the user explicitly approves the unit NFR plan
- [ ] Approval must cover unit NFR decisions and setup approach
- [ ] If user requests changes, update plan and repeat approval process

### Step 8: Record Approval Response
- [ ] Log the user's approval response with timestamp in `aidlc-docs/audit.md`
- [ ] Include the exact user response text
- [ ] Mark the approval status clearly

### Step 9: Update Progress
- [ ] Mark Phase 8 complete in `aidlc-state.md`
- [ ] Update the "Current Status" section
- [ ] Prepare for transition to Phase 9

## Completion Criteria
- Unit NFR and setup questions answered with [Answer]: tags
- Unit NFR plan document created and approved
- Unit technology stack decisions documented
- Unit deployment approach planned
- Ready for Phase 9 generation