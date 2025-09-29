# Phase 5: Unit of Work Planning - Detailed Steps

## Step-by-Step Execution

### 1. Create Unit of Work Plan
- Generate plan with checkboxes [] for decomposing system into units of work
- **DEFINITION**: A unit of work is a group of related stories that can be built into a microservice independently of other units of work. Can stand on its own.
- Focus on breaking down the system into independently developable and deployable units
- Each step and sub-step should have a checkbox []

### 2. Include Mandatory Unit Artifacts in Plan
- **ALWAYS** include these mandatory artifacts in the unit plan:
  - [ ] Generate unit-of-work.md with unit definitions and responsibilities
  - [ ] Generate unit-of-work-dependency.md with dependency matrix
  - [ ] Generate unit-of-work-story-map.md mapping stories to units
  - [ ] Validate unit boundaries and dependencies
  - [ ] Ensure all stories are assigned to units

### 3. Include Decomposition Questions
- EMBED questions using [Answer]: tag format about:

#### Story Grouping and Organization
- How should user stories be grouped into logical units?
- What criteria should determine unit boundaries (domain, team, technology)?
- Should units be organized by business capability or technical layer?
- How should cross-cutting concerns be handled across units?

#### Dependencies and Integration
- What are the acceptable dependency relationships between units?
- How should data consistency be maintained across units?
- What integration patterns should be used (API calls, events, messaging)?
- How should shared data and services be handled?

#### Team Alignment and Ownership
- How many teams will work on this system?
- Should each unit be owned by a single team?
- How should shared components and services be managed?
- What are the team's expertise and capacity constraints?

#### Technical Considerations
- What are the scalability requirements for different parts of the system?
- Should units use different technology stacks?
- How should deployment and infrastructure be organized?
- What are the performance and latency requirements between units?

#### Business Domain Analysis
- What are the core business domains and subdomains?
- How should bounded contexts be defined?
- What are the natural seams in the business processes?
- How should business rules be distributed across units?

### 4. Store UOW Plan
- Save as `aidlc-docs/plans/unit-of-work-plan.md`
- Include all [Answer]: tags for user input
- Ensure plan covers all aspects of system decomposition

### 5. Request User Input
- Ask user to fill [Answer]: tags directly in the plan document
- Emphasize importance of decomposition decisions
- Provide clear instructions on completing the [Answer]: tags

### 6. Collect Answers
- Wait for user to provide answers to all questions using [Answer]: tags in the document
- Do not proceed until ALL [Answer]: tags are completed
- Review the document to ensure no [Answer]: tags are left blank

### 7. ANALYZE ANSWERS (MANDATORY)
Before proceeding, you MUST carefully review all user answers for:
- **Vague or ambiguous responses**: "mix of", "somewhere between", "not sure", "depends"
- **Undefined criteria or terms**: References to concepts without clear definitions
- **Contradictory answers**: Responses that conflict with each other
- **Missing generation details**: Answers that lack specific guidance
- **Answers that combine options**: Responses that merge different approaches without clear decision rules

### 8. MANDATORY Follow-up Questions
If the analysis in step 7 reveals ANY ambiguous answers, you MUST:
- Add specific follow-up questions to the plan document using [Answer]: tags
- DO NOT proceed to approval until all ambiguities are resolved
- Examples of required follow-ups:
  - "You mentioned 'mix of A and B' - what specific criteria should determine when to use A vs B?"
  - "You said 'somewhere between A and B' - can you define the exact middle ground approach?"
  - "You indicated 'not sure' - what additional information would help you decide?"
  - "You mentioned 'depends on complexity' - how do you define complexity levels?"

### 9. Log Approval
- Log prompt and response in audit.md with timestamp
- Use ISO 8601 timestamp format
- Include complete approval prompt text

### 10. Update Progress
- Mark Phase 5 complete in aidlc-state.md
- Update the "Current Status" section
- Prepare for transition to Phase 6