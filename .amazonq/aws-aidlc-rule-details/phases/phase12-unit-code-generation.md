# Phase 12: Per-Unit Code Generation

## Overview
Execute the unit code generation plan created in Phase 10. Follow the plan exactly as written.

## Steps to Execute

### Step 1: Load Unit Code Generation Plan
- [ ] Read the complete plan from `aidlc-docs/plans/{unit-name}-code-generation-plan.md`
- [ ] Identify the next uncompleted step (first [ ] checkbox)
- [ ] Load the context for that step (unit, dependencies, stories)

### Step 2: Execute Current Step
- [ ] Perform exactly what the current step describes
- [ ] Generate code, tests, or documentation as specified
- [ ] Follow the unit's story requirements
- [ ] Respect dependencies and interfaces defined in the plan

### Step 3: Update Progress
- [ ] Mark the completed step as [x] in the unit code generation plan
- [ ] Mark associated unit stories as [x] when their generation is finished
- [ ] Update `aidlc-docs/aidlc-state.md` current status
- [ ] Save all generated artifacts

### Step 4: Continue or Complete
- [ ] If more steps remain, return to Step 1
- [ ] If all steps complete, mark Phase 11 as complete for this unit
- [ ] Provide final summary of unit generation

## Critical Rules
- **NO HARDCODED LOGIC**: Only execute what's written in the unit plan
- **FOLLOW PLAN EXACTLY**: Do not deviate from the step sequence
- **UPDATE CHECKBOXES**: Mark [x] immediately after completing each step
- **STORY TRACEABILITY**: Mark unit stories [x] when functionality is implemented
- **RESPECT DEPENDENCIES**: Only implement when unit dependencies are satisfied

## Completion Criteria
- All steps in unit code generation plan marked [x]
- All unit stories implemented according to plan
- All tests passing
- Unit deployed and integrated
- Complete unit microservice ready for use