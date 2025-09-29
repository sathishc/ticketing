# Phase 11: Per-Unit Code Plan Generation

## Overview
Create a detailed, step-by-step code generation plan for the current unit of work. This plan becomes the single source of truth for Phase 10 execution.

## Steps to Execute

### Step 1: Analyze Unit Context
- [ ] Read unit design artifacts from Phase 7
- [ ] Read unit story map to understand assigned stories
- [ ] Identify unit dependencies and interfaces
- [ ] Validate unit is ready for code generation

### Step 2: Create Detailed Unit Code Generation Plan
- [ ] Create explicit steps for unit generation:
  - Business Logic Generation
  - Business Logic Unit Testing
  - Business Logic Summary
  - API Layer Generation
  - API Layer Unit Testing
  - API Layer Summary
  - Repository Layer Generation
  - Repository Layer Unit Testing
  - Repository Layer Summary
  - Deploy Code Generation + Update
  - Deploy Unit as Microservice
- [ ] Number each step sequentially
- [ ] Include story mapping references for this unit
- [ ] Add checkboxes [ ] for each step

### Step 3: Include Unit Generation Context
- [ ] For this unit, include:
  - Stories implemented by this unit
  - Dependencies on other units/services
  - Expected interfaces and contracts
  - Database entities owned by this unit
  - Service boundaries and responsibilities

### Step 4: Create Unit Plan Document
- [ ] Save complete plan as `aidlc-docs/plans/{unit-name}-code-generation-plan.md`
- [ ] Include step numbering (Step 1, Step 2, etc.)
- [ ] Include unit context and dependencies
- [ ] Include story traceability
- [ ] Ensure plan is executable step-by-step
- [ ] Emphasize that this plan is the single source of truth for Phase 10

### Step 5: Summarize Unit Plan
- [ ] Provide summary of the unit code generation plan to the user
- [ ] Highlight unit generation approach
- [ ] Explain step sequence and story coverage
- [ ] Note total number of steps and estimated scope

### Step 6: Log Approval Prompt
- [ ] Before asking for approval, log the prompt with timestamp in `aidlc-docs/audit.md`
- [ ] Include reference to the complete unit code generation plan
- [ ] Use ISO 8601 timestamp format

### Step 7: Wait for Explicit Approval
- [ ] Do not proceed until the user explicitly approves the unit code generation plan
- [ ] Approval must cover the entire plan and generation sequence
- [ ] If user requests changes, update the plan and repeat approval process

### Step 8: Record Approval Response
- [ ] Log the user's approval response with timestamp in `aidlc-docs/audit.md`
- [ ] Include the exact user response text
- [ ] Mark the approval status clearly

### Step 9: Update Progress
- [ ] Mark Phase 10 complete in `aidlc-state.md`
- [ ] Update the "Current Status" section
- [ ] Prepare for transition to Phase 11 (Unit Code Generation)

## Completion Criteria
- Complete unit code generation plan created
- Unit generation steps explicitly defined with checkboxes
- Story mapping included for traceability
- Plan approved by user
- Plan is ready for step-by-step execution in Phase 11