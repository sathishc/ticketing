# Phase 10: Per-Unit NFR Generation

## Overview
Execute the unit NFR setup plan created in Phase 8. Follow the plan exactly as written. Some steps may require human intervention when AI cannot perform certain tasks.

## Steps to Execute

### Step 1: Load Unit NFR Setup Plan
- [ ] Read the complete setup plan from `aidlc-docs/plans/{unit-name}-nfr-setup-plan.md`
- [ ] Identify the next uncompleted step (first [ ] checkbox)
- [ ] Load the context and requirements for that step

### Step 2: Execute Current Step
- [ ] Perform exactly what the current step describes
- [ ] If step can be performed by AI, execute it directly
- [ ] If step requires human intervention, hand over to human with clear instructions
- [ ] Follow the approved NFR and setup decisions from Phase 8

### Step 3: Handle Human Tasks
- [ ] When encountering tasks AI cannot perform, clearly identify them as **HUMAN TASK**
- [ ] Provide specific instructions to the user for the task
- [ ] Wait for user confirmation before proceeding to next step
- [ ] If user cannot complete a task, offer alternative approaches or skip if non-critical
- [ ] Document all human-completed tasks for audit trail

### Step 4: Update Progress
- [ ] Mark the completed step as [x] in the unit setup plan
- [ ] Update `aidlc-docs/aidlc-state.md` current status
- [ ] Save all generated artifacts and configurations

### Step 5: Continue or Complete
- [ ] If more steps remain, return to Step 1
- [ ] If all steps complete, verify unit setup is ready for code plan generation
- [ ] Mark Phase 9 as complete

## Critical Rules
- **NO HARDCODED LOGIC**: Only execute what's written in the unit setup plan
- **FOLLOW PLAN EXACTLY**: Do not deviate from the step sequence
- **UPDATE CHECKBOXES**: Mark [x] immediately after completing each step
- **HUMAN HANDOVER**: Clearly identify and hand over tasks AI cannot perform
- **VERIFY COMPLETION**: Ensure all unit setup is working before proceeding

## Human Task Guidelines
- Provide clear, specific instructions for human tasks
- Include context about why the task is needed
- Offer alternatives if the primary approach fails
- Document completion status and any issues encountered

## Completion Criteria
- All steps in unit setup plan marked [x]
- All unit technology stack configured according to plan
- All unit organizational constraints implemented
- All human tasks completed and verified
- Unit setup verified and ready for code plan generation phase