# Phase 4: Architectural Decision - Detailed Steps

## Step-by-Step Execution

### 1. Present Unit of Work Options
- Explain the concept of units of work based on the requirements and stories
- Each unit of work is an independently deployable component with:
  - **Business Logic Layer** - Core domain logic
  - **Data Access Layer** - Persistence/storage
  - **Interface Layer** - Controllers/APIs/Facades

#### Single Unit Approach
- **Benefits**: 
  - Simpler deployment and operations
  - Easier debugging and testing
  - Better performance for small to medium applications
  - Lower operational complexity
  - Faster initial development
- **Drawbacks**:
  - Scaling limitations
  - Technology lock-in
  - Potential for tight coupling
  - Larger codebase complexity over time
- **Best For**:
  - Small to medium teams
  - Simpler applications
  - Rapid prototyping
  - Limited operational expertise

#### Multiple Units Approach
- **Benefits**:
  - Independent scaling
  - Technology diversity
  - Team autonomy
  - Fault isolation
  - Independent deployment
- **Drawbacks**:
  - Operational complexity
  - Network latency
  - Data consistency challenges
  - Debugging complexity
  - Higher initial overhead
- **Best For**:
  - Large teams
  - Complex domains
  - High scalability requirements
  - Strong operational capabilities

### 2. Create Architectural Decision Document
- Create `aidlc-docs/design/architectural-decisions.md` with the following template:

```markdown
# Architectural Decisions

## Unit of Work Decision Framework

### Unit of Work Options

#### Single Unit Approach
- **Benefits**: Simpler deployment, easier debugging, better performance for small-medium apps, lower operational complexity, faster initial development
- **Drawbacks**: Scaling limitations, technology lock-in, potential tight coupling, larger codebase complexity over time
- **Best For**: Small-medium teams, simpler applications, rapid prototyping, limited operational expertise

#### Multiple Units Approach
- **Benefits**: Independent scaling, technology diversity, team autonomy, fault isolation, independent deployment
- **Drawbacks**: Operational complexity, network latency, data consistency challenges, debugging complexity, higher initial overhead
- **Best For**: Large teams, complex domains, high scalability requirements, strong operational capabilities

### Decision Questions

#### Team and Organization
1. What is your current team size and structure?
[Answer]: 

2. How many developers will be working on this project?
[Answer]: 

3. Do you have separate teams for different domains/features?
[Answer]: 

4. What is your team's experience with distributed systems?
[Answer]: 

5. Do you have dedicated DevOps/operations expertise?
[Answer]: 

#### Unit Boundaries and Responsibilities
6. How many independently deployable units of work do you need?
[Answer]: 

7. What are the natural boundaries in your business domain?
[Answer]: 

8. Should different features be in separate units or combined?
[Answer]: 

9. Do you need units to scale independently?
[Answer]: 

10. Are there clear data ownership boundaries?
[Answer]: 

#### Deployment and Operations
11. What is your preferred deployment platform (cloud, on-premise, hybrid)?
[Answer]: 

12. Do you want to deploy all units together or separately?
[Answer]: 

13. What is your monitoring and observability strategy?
[Answer]: 

14. How comfortable is your team with managing multiple deployable units?
[Answer]: 

15. What are your availability and uptime requirements?
[Answer]: 

#### Complexity and Timeline
16. How complex is your business domain?
[Answer]: 

17. What is your timeline for initial delivery?
[Answer]: 

18. Do you need to integrate with many external systems?
[Answer]: 

19. How important is rapid initial development vs long-term maintainability?
[Answer]: 

20. What is your tolerance for operational complexity?
[Answer]: 

#### Technology and Integration
21. Do you need to use different technologies for different units?
[Answer]: 

22. Are there existing systems that need integration?
[Answer]: 

23. Do you have specific compliance or security requirements?
[Answer]: 

24. What is your data consistency and transaction requirement?
[Answer]: 

### Final Decision
**Number of Units**: [Answer]: 
**Rationale**: [Answer]: 
**Key Factors**: [Answer]: 
**Trade-offs Acknowledged**: [Answer]: 
**Decision Date**: [Answer]: 
```

- Present the document to the user for completion

### 3. Process User Responses
- Review all [Answer]: tags in the architectural-decisions.md document
- **MANDATORY ANSWER ANALYSIS**: Before proceeding, carefully review all user answers for:
  - Vague or ambiguous responses ("mix of", "somewhere between", "not sure")
  - Undefined criteria or terms
  - Contradictory answers
  - Missing decision details
  - Answers that combine options without clear decision rules
- **MANDATORY Follow-up Questions**: If analysis reveals ANY ambiguous answers, add specific follow-up questions to the document using [Answer]: tags. DO NOT proceed until all ambiguities are resolved

### 4. Log Architectural Decision
- Log the architectural decision prompt and user responses with timestamp in `aidlc-docs/audit.md`
- Include the final decision and rationale
- Use ISO 8601 timestamp format
- Note this as "Architectural Decision Phase - Decision"

### 5. Finalize Decision Document
- Update `aidlc-docs/design/architectural-decisions.md` with:
  - The number of units of work chosen (1 or N)
  - Unit boundaries and responsibilities
  - Detailed rationale based on user responses
  - Key factors that influenced the decision
  - Trade-offs acknowledged
  - Any specific architectural constraints or requirements
  - Decision date and context

### 6. Update Process Roadmap
- Update `aidlc-state.md` with the unified phases:
  - Phase 5: Unit Planning
  - Phase 6: Unit Generation
  - Phase 7: Unit Design Planning (Per-Unit Loop)
  - Phase 8: Unit Design Generation (Per-Unit Loop)
  - Phase 9: Unit NFR Planning (Per-Unit Loop)
  - Phase 10: Unit NFR Generation (Per-Unit Loop)
  - Phase 11: Unit Code Planning (Per-Unit Loop)
  - Phase 12: Unit Code Generation (Per-Unit Loop)
- Update the "Current Status" to reflect the unit decision
- Mark Phase 4 as complete

### 7. Continue with Unified Workflow
- All projects follow the same unified workflow regardless of unit quantity
- Phases 7-12 repeat for each unit of work
- Each unit follows identical development pattern: Design → NFR → Setup → Code Generation
- Confirm that the unit decision is recorded and the unified workflow will be followed