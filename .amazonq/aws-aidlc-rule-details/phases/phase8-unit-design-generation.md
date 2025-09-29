# Phase 8: Per-Unit Design Generation

## Overview
Execute the unit design plan created in Phase 7a. Follow the plan exactly as written.

## Steps to Execute

### Step 1: Load Unit Design Plan
- [ ] Read the complete plan from `aidlc-docs/plans/{unit-name}-design-plan.md`
- [ ] Identify the next uncompleted step (first [ ] checkbox)
- [ ] Load the context and requirements for that step

### Step 2: Execute Current Step
- [ ] Perform exactly what the current step describes
- [ ] Generate unit design artifacts as specified in the plan
- [ ] Follow the approved design approach from Phase 7a
- [ ] Use the patterns and decisions specified in the unit design plan

### Step 3: Update Progress
- [ ] Mark the completed step as [x] in the unit design plan
- [ ] Update `aidlc-docs/aidlc-state.md` current status
- [ ] Save all generated artifacts

### Step 4: Continue or Complete
- [ ] If more steps remain, return to Step 1
- [ ] If all steps complete, verify unit design is ready for NFR planning
- [ ] Mark Phase 7b as complete for this unit

## Critical Rules
- **NO HARDCODED LOGIC**: Only execute what's written in the unit design plan
- **FOLLOW PLAN EXACTLY**: Do not deviate from the step sequence
- **UPDATE CHECKBOXES**: Mark [x] immediately after completing each step
- **USE APPROVED APPROACH**: Follow the design methodology from Phase 7a
- **VERIFY COMPLETION**: Ensure all unit design artifacts are complete before proceeding

## Completion Criteria
- All steps in unit design plan marked [x]
- All unit design artifacts generated according to plan
- Unit design verified and ready for NFR planning phase