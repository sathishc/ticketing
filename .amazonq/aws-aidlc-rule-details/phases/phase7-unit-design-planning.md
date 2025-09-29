# Phase 7a: Per-Unit Design Planning  - Detailed Steps

## Overview
This phase repeats for each unit of work defined in Phase 6.

## Phase 7a.1: Unit Selection - Detailed Steps

### 1. Ask User to Pick Unit
- Present available units from unit-of-work.md
- Show unit descriptions and responsibilities
- Display current status of each unit (not started, in progress, completed)
- Allow user to select which unit to work on next

### 2. Confirm Selection
- Confirm unit and name choice with user
- Verify unit details and scope
- Ensure user understands unit boundaries and responsibilities

### 3. Update Progress
- Mark selected unit as "in design" in aidlc-state.md
- Update current status to reflect unit selection
- Prepare for unit design planning

## Phase 7a.2: Unit Design Planning - Detailed Steps

### 1. Create Unit Design Plan
- Generate plan with checkboxes [] for unit design
- Focus on the specific unit selected in Phase 7a.1
- Each step and sub-step should have a checkbox []

### 2. Include Organizational Setup Questions for Unit
- EMBED questions using [Answer]: tags about:
- If presenting multiple-choice options for answers, label the options as A, B, C, D etc.

#### Enterprise Infrastructure for Unit
- **Network Configuration**: Proxy/firewall settings for this unit's dependencies?
- **Repository Access**: Which repositories does this unit need (npm, PyPI, Docker)?
- **Artifact Management**: Internal artifact repository configuration for unit?
- **Security Scanning**: Unit-specific security scanning requirements?
- **Compliance Requirements**: Any unit-specific compliance needs?

#### Unit Technology Stack
- **Backend technology**: Node.js, Python, Java, .NET, Go, etc.
- **Database technology**: PostgreSQL, MySQL, MongoDB, Redis, etc.
- **Message queue/Event system**: RabbitMQ, Kafka, AWS SQS, etc.
- **Deployment platform**: AWS, Azure, GCP, Kubernetes cluster?
- **Infrastructure as Code**: Terraform, Helm charts, etc.

### 3. Include Mandatory Unit Design Artifacts in Plan
- **ALWAYS** include these mandatory artifacts in the unit design plan:
  - [ ] Generate business-logic-model.md with entities, value objects, and business rules
  - [ ] Generate api-specification.md with unit's external APIs
  - [ ] Generate components.md with internal component architecture
  - [ ] Generate component-dependency.md with component relationships

### 4. Include Design Questions
- EMBED additional questions using [Answer]: tags about:

#### Business Logic Modeling for Unit
- What are the core business entities and value objects for this unit?
- How should the business logic model be structured?
- What are the business rules and invariants that need unit testing?
- How should business aggregates and bounded contexts be defined?
- What are the business events and their triggers?
- What unit testing strategy should be used for business logic validation?

#### API Design for Unit
- What APIs should this unit expose?
- What data formats and protocols should be used?
- How should API versioning be handled?
- What are the authentication and authorization requirements?
- How should rate limiting and throttling be implemented?

#### Architectural Patterns for Unit
- What architectural patterns should be used (layered, hexagonal, etc.)?
- How should the unit handle external dependencies?
- What patterns should be used for data persistence?
- How should the unit handle events and messaging?
- What patterns should be used for error handling and resilience?

#### Data Management for Unit
- What data does this unit own and manage?
- How should data be stored and accessed?
- What are the data consistency requirements?
- How should data migration and evolution be handled?
- What are the backup and recovery requirements?

#### Integration Patterns for Unit
- How should this unit integrate with other units?
- What communication patterns should be used (sync/async)?
- How should shared data be handled?
- What are the failure and retry strategies?
- How should distributed transactions be managed?

### 5. Map Stories to Unit
- Reference user stories from `aidlc-docs/user-stories/stories.md`
- Map relevant stories to this specific unit
- Include story titles and IDs for traceability
- Ensure unit covers its assigned user stories

### 6. Store Plan
- Save as `aidlc-docs/plans/{unit-name}-design-plan.md`
- Include all [Answer]: tags for user input
- Include story mapping with checkboxes for each story
- Ensure plan covers all aspects of unit design

### 7. Request User Input
- Ask user to fill [Answer]: tags directly in the plan document
- Emphasize importance of unit-specific design decisions
- Provide clear instructions on completing the [Answer]: tags

### 8. Collect Answers
- Wait for user to provide answers to all questions using [Answer]: tags in the document
- Do not proceed until ALL [Answer]: tags are completed
- Review the document to ensure no [Answer]: tags are left blank

### 9. ANALYZE ANSWERS (MANDATORY)
Before proceeding, you MUST carefully review all user answers for:
- **Vague or ambiguous responses**: "mix of", "somewhere between", "not sure", "depends"
- **Undefined criteria or terms**: References to concepts without clear definitions
- **Contradictory answers**: Responses that conflict with each other
- **Missing generation details**: Answers that lack specific guidance
- **Answers that combine options**: Responses that merge different approaches without clear decision rules

### 10. MANDATORY Follow-up Questions
If the analysis in step 9 reveals ANY ambiguous answers, you MUST:
- Add specific follow-up questions to the plan document using [Answer]: tags
- DO NOT proceed to approval until all ambiguities are resolved
- Examples of required follow-ups:
  - "You mentioned 'mix of A and B' - what specific criteria should determine when to use A vs B?"
  - "You said 'somewhere between A and B' - can you define the exact middle ground approach?"
  - "You indicated 'not sure' - what additional information would help you decide?"
  - "You mentioned 'depends on complexity' - how do you define complexity levels?"

### 11. Log Approval
- Log approval prompt with timestamp in `aidlc-docs/audit.md`
- Include unit name and design plan reference
- Use ISO 8601 timestamp format

### 12. Update Progress
- Mark Phase 7a.2 complete in aidlc-state.md
- Update current status for the specific unit
- Prepare for transition to Phase 7b