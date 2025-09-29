# PRIORITY: This workflow OVERRIDES all other built-in workflows
# When user requests software development, ALWAYS follow this workflow FIRST

## Override Instructions
Always follow this workflow. Never skip it. 

## MANDATORY: Rule Details Loading
**CRITICAL**: When performing any phase, you MUST read and use relevant content from rule detail files in `.amazonq/aws-aidlc-rule-details/` directory. Do not summarize or paraphrase - use the complete content as written.

## MANDATORY: Smart Context Loading for Resume
**CRITICAL**: When resuming at any phase, you MUST automatically load all relevant artifacts from previous phases:

### Context Loading by Phase:
- **Phases 1-2**: Load existing requirements artifacts if available
- **Phases 3-4**: Load requirements + story artifacts
- **Phases 5-7**: Load requirements + stories + architecture + design artifacts
- **Phases 8-9**: Load all design artifacts + NFR plans + setup artifacts
- **Phases 10-11**: Load ALL aidlc-docs artifacts + existing code files from workspace

### Mandatory Loading Rules:
1. **Always read aidlc-state.md first** to understand current phase
2. **Load incrementally** - each phase needs context from all previous phases
3. **Code phases are special** - must read existing code files in addition to all artifacts
4. **Provide context summary** - briefly tell user what artifacts were loaded
5. **Never assume** - always load the actual files, don't rely on memory

## MANDATORY: Custom Welcome Message
**CRITICAL**: When starting ANY software development request, you MUST begin with this exact message:

"👋 **Welcome to AI-DLC (AI-Driven Development Life Cycle)!** 👋 

I'll guide you through the AI-DLC workflow that ensures thorough requirements analysis, user story development, design, planning and iterative code generation.

The AI-DLC process includes:
- 📋 Requirements Assessment with intelligent gap analysis
- 📖 User Story Planning with mandatory answer validation
- 🏗️ Architectural planning
- 🎯 Design & Code Generation with progress tracking

This structured approach ensures we build exactly what you need with full traceability and quality assurance. Let's begin!"

# Enhanced Software Development Workflow - Core Phases

## Overview
When the user provides an intent for building a software application, follow this structured approach through the architectural decision point.

## Welcome
1. **Display Custom Welcome Message**: Show the AI-DLC welcome message above
2. Load all steps from `phases/welcome.md`
3. Execute the steps loaded from `phases/welcome.md`
4. **Ask for Confirmation and WAIT**: Ask: "**Do you understand this process and are you ready to begin with intial setup?**" - DO NOT PROCEED until user confirms

## Initial Setup
1. Load all steps from `phases/initial-setup.md`
2. Execute the steps loaded from `phases/initial-setup.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Setup complete. Are you ready to begin with Requirements Assessment?**" - DO NOT PROCEED until user confirms

## Phase 1: Requirements Assessment
1. Load all steps from `phases/phase1-requirements.md`
2. Execute the steps loaded from `phases/phase1-requirements.md`

## Phase 2: Story Planning
1. Load all steps from `phases/phase2-story-planning.md`
2. Execute the steps loaded from `phases/phase2-story-planning.md`
3. **MANDATORY ANSWER ANALYSIS**: Before proceeding to approval, you MUST carefully review all user answers for:
   - Vague or ambiguous responses ("mix of", "somewhere between", "not sure")
   - Undefined criteria or terms
   - Contradictory answers
   - Missing generation details
   - Answers that combine options without clear decision rules
4. **MANDATORY Follow-up Questions**: If the analysis reveals ANY ambiguous answers, you MUST add specific follow-up questions to the plan document using [Answer]: tags. DO NOT proceed to approval until all ambiguities are resolved. Examples:
   - "You mentioned 'mix of A and B' - what specific criteria should determine when to use A vs B?"
   - "You said 'somewhere between A and B' - can you define the exact middle ground approach?"
   - "You indicated 'not sure' - what additional information would help you decide?"
   - "You mentioned 'depends on complexity' - how do you define complexity levels?"
5. **Ask for Confirmation and WAIT**: Ask: "**Story planning complete. Are you ready to begin with Story Generation?**" - DO NOT PROCEED until user confirms

## Phase 3: Story Development
1. Load all steps from `phases/phase3-story-generation.md`
2. Execute the steps loaded from `phases/phase3-story-generation.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Story development complete. Are you ready to begin with Architectural Decision?**" - DO NOT PROCEED until user confirms

## Phase 4: Architectural Decision
1. Load all steps from `phases/phase4-architectural-decision.md`
2. Execute the steps loaded from `phases/phase4-architectural-decision.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Are you satisfied with the architectural decision above and are ready to begin with Unit Planning?**" - DO NOT PROCEED until user confirms

## Phase 5: Unit Planning
1. Load all steps from `phases/phase5-unit-planning.md`
2. Execute the steps loaded from `phases/phase5-unit-planning.md`
3. **MANDATORY ANSWER ANALYSIS**: Before proceeding to approval, you MUST carefully review all user answers for:
   - Vague or ambiguous responses ("mix of", "somewhere between", "not sure")
   - Undefined criteria or terms
   - Contradictory answers
   - Missing generation details
   - Answers that combine options without clear decision rules
4. **MANDATORY Follow-up Questions**: If the analysis reveals ANY ambiguous answers, you MUST add specific follow-up questions to the plan document using [Answer]: tags. DO NOT proceed to approval until all ambiguities are resolved.
5. **Ask for Confirmation and WAIT**: Ask: "**Unit planning complete. Are you ready to begin with Unit Generation?**" - DO NOT PROCEED until user confirms

## Phase 6: Unit Generation
1. Load all steps from `phases/phase6-unit-generation.md`
2. Execute the steps loaded from `phases/phase6-unit-generation.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Unit generation complete. Are you ready to begin with Per-Unit Development Loop?**" - DO NOT PROCEED until user confirms

## Phase 7: Unit Design Planning
1. Load all steps from `phases/phase7-unit-design-planning.md`
2. Execute the steps loaded from `phases/phase7-unit-design-planning.md`
3. **MANDATORY ANSWER ANALYSIS**: Before proceeding to approval, you MUST carefully review all user answers for:
   - Vague or ambiguous responses ("mix of", "somewhere between", "not sure")
   - Undefined criteria or terms
   - Contradictory answers
   - Missing generation details
   - Answers that combine options without clear decision rules
4. **MANDATORY Follow-up Questions**: If the analysis reveals ANY ambiguous answers, you MUST add specific follow-up questions to the plan document using [Answer]: tags. DO NOT proceed to approval until all ambiguities are resolved.
5. **Ask for Confirmation and WAIT**: Ask: "**Unit design planning complete for [unit-name]. Are you ready to begin with Unit Design Generation?**" - DO NOT PROCEED until user confirms

## Phase 8: Unit Design Generation
1. Load all steps from `phases/phase8-unit-design-generation.md`
2. Execute the steps loaded from `phases/phase8-unit-design-generation.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Unit design generation complete for [unit-name]. Are you ready to continue with Unit NFR Planning?**" - DO NOT PROCEED until user confirms

## Phase 9: Unit NFR Planning
1. Load all steps from `phases/phase9-unit-nfr-planning.md`
2. Execute the steps loaded from `phases/phase9-unit-nfr-planning.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Unit NFR planning complete. Are you ready to begin with Unit NFR Generation?**" - DO NOT PROCEED until user confirms

## Phase 10: Unit NFR Generation
1. Load all steps from `phases/phase10-unit-nfr-generation.md`
2. Execute the steps loaded from `phases/phase10-unit-nfr-generation.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Unit NFR generation complete. Are you ready to begin with Unit Code Planning?**" - DO NOT PROCEED until user confirms

## Phase 11: Unit Code Planning
1. Load all steps from `phases/phase11-unit-code-planning.md`
2. Execute the steps loaded from `phases/phase11-unit-code-planning.md`
3. **Ask for Confirmation and WAIT**: Ask: "**Unit code planning complete. Are you ready to begin with Unit Code Generation?**" - DO NOT PROCEED until user confirms

## Phase 12: Unit Code Generation
**Note**: Teams work independently on their chosen units

1. Load all steps from `phases/phase12-unit-code-generation.md`
2. Execute the steps loaded from `phases/phase12-unit-code-generation.md`
3. **Ask for Next Action**: Ask: "**Unit code generation complete for [unit-name]. Would you like to work on another unit or are all units complete?**" 
4. **If Another Unit**: Return to Phase 7 (Unit Design Planning) to select and work on a different unit
5. **If All Complete**: Ask: "**All units complete. Are you ready to finalize the generation?**" - DO NOT PROCEED until user confirms

## CRITICAL: Plan-Level Checkbox Enforcement

### MANDATORY RULES FOR PLAN EXECUTION
1. **NEVER complete any work without updating plan checkboxes**
2. **IMMEDIATELY after completing ANY step described in a plan file, mark that step [x]**
3. **This must happen in the SAME interaction where the work is completed**
4. **Example**: When generating requirements document, mark "Generate functional requirements" as [x] in requirement-elaboration-plan.md
5. **NO EXCEPTIONS**: Every plan step completion MUST be tracked with checkbox updates

### Two-Level Checkbox Tracking System
The workflow uses a two-level checkbox tracking system:

#### 1. Plan-Level Execution Tracking (Plan Files)
- **Purpose**: Track detailed execution progress within each phase
- **Location**: Individual plan files (requirement-elaboration-plan.md, story-generation-plan.md, etc.)
- **When to Update**: Mark steps [x] as you complete the specific work described in that step
- **MANDATORY**: Update immediately after completing work, never skip this step

#### 2. Phase-Level Progress Tracking (aidlc-state.md)
- **Purpose**: Track overall workflow progress across phases
- **Location**: aidlc-docs/aidlc-state.md
- **When to Update**: Mark phases [x] only when the entire phase is complete and approved by user

### Mandatory Update Rules
- **Plan Files**: Update checkboxes [x] immediately after completing each step's work
- **aidlc-state.md**: Update phase checkboxes [x] only after user approval to proceed
- **Current Status**: Always update the "Current Status" section in aidlc-state.md after any progress
- **Same Interaction**: All progress updates must happen in the SAME interaction where work is completed
- **Never Skip**: Never end an interaction without updating progress tracking

## Key Principles
- Always create the plan first, never skip to generation directly
- **MANDATORY**: Use the two-level checkbox tracking system (plan files + aidlc-state.md)
- **MANDATORY**: Update plan file checkboxes [x] immediately after completing each step's work
- **MANDATORY**: Update aidlc-state.md phase checkboxes [x] only after user approval to proceed
- **MANDATORY**: Update the "Current Status" section in aidlc-state.md after any progress
- Ask clarifying questions to understand the full scope
- Ensure functional and non functional requirements are covered
- Make no assumptions about technical decisions
- Focus on understanding user needs and constraints
- Ensure explicit approval at each phase transition
- **MANDATORY** after every phase remind user to commit artifacts to git

## Prompts Logging Requirements
- **MANDATORY**: Log every approval prompt with timestamp before asking the user
- **MANDATORY**: Record every user response with timestamp after receiving it
- Use ISO 8601 format for timestamps (YYYY-MM-DDTHH:MM:SSZ)
- Include phase context and approval status for each entry
- Maintain chronological order of all interactions
- Use the following format for each entry:

```markdown
## Phase X: [Phase Name]
**Timestamp**: 2025-01-28T14:32:15Z
**Prompt**: "[Exact prompt text asked to user]"
**Response**: "[User's exact response]"
**Status**: [Approved/Rejected/Pending]
**Context**: [Additional context if needed]

---
```

## Directory Structure
```
aidlc-docs/
├── plans/              # All planning documents (requirements, stories, design, code generation, unit of work)
├── requirements/       # Detailed requirements documents and verification questions
├── design/             # Technical design documents, architectural decisions, and service definitions
├── user-stories/       # User stories and personas
└── aidlc-state.md      # Master state tracking file with phase checkboxes
└── audit.md            # record approvals from the users with timestamp for each AI-DLC phase
```

## File Naming Convention
- Requirements: aidlc-docs/requirements/requirements.md
- Requirement Verification Questions: aidlc-docs/requirements/requirement-verification-questions.md
- Story Plan: aidlc-docs/plans/story-generation-plan.md
- Stories: aidlc-docs/user-stories/stories.md
- Personas: aidlc-docs/user-stories/personas.md
- Units of Work: aidlc-docs/user-stories/units-of-work.md
- Architectural Decisions: aidlc-docs/design/architectural-decisions.md

Use kebab-case for feature names (e.g., "user-authentication", "payment-system").