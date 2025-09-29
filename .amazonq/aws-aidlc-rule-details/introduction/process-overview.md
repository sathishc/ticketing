# AI-DLC Workflow Overview

## The Workflow:
• **Requirements Assessment** → **Stories** → **Architectural Choice** → **Design** → **Setup** → **Code Plan** → **Code Generation**

## Your Team's Role:
• **Collaborate together** to answer questions in planning documents using [Answer]: tags
• **Work as a team** to review and approve each phase before proceeding
• **Collectively decide** on architectural approach (one or multiple services)
• **Important**: This is a team effort - involve relevant stakeholders for each phase

**MANDTORY** DISPLAY THE DIAGRAM BELOW
## AI's Role:
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐    ┌─────────────────┐
│ Create Plan │───▶│ Seek            │───▶│ Modify Plan │───▶│ Implement Plan  │
│             │    │ Clarification   │    │             │    │                 │
└─────────────┘    └─────────────────┘    └─────────────┘    └─────────────────┘
       ▲                                                                 │
       │                                                                 │
       └─────────────────────────────────────────────────────────────────┘
```

**MANDTORY** DISPLAY THE DIAGRAM BELOW
## AI-DLC Workflow:
```
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │ Intent Statement│    │   Requirements  │    │   Mixed Input   │
    │   (New Project) │    │    Document     │    │  (Any Format)   │
    └─────────────────┘    │ (Existing Reqs) │    └─────────────────┘
            │              └─────────────────┘           │
            │                      │                     │
            └──────────────────────┼─────────────────────┘
                                   ▼
                         ┌───────────────────┐
                         │    Requirements   │
                         │     Assessment    │
                         └───────────────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │    User Story   │
                         │     Planning    │
                         └─────────────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │    User Story   │
                         │    Development  │
                         └─────────────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   Architectural │
                         │    Decision     │
                         └─────────────────┘
                                   │
                                   ▼
                         "How many units of work?"
                                   │
                              1 or N Units
                                   │
                                   ▼
                         ┌────────────────────┐
                         │  Unit(s) Planning  │
                         └────────────────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ Unit(s) Generation │
                         └────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │        Per-Unit Loop        │
                    │    (Repeat for each unit)   │
                    │                             │
                    │  ┌──────────────────────┐   │
                    │  │   Design Planning    │   │
                    │  └──────────────────────┘   │
                    │            ↓                │
                    │  ┌──────────────────────┐   │
                    │  │   Design Generation  |   │
                    │  └──────────────────────┘   │
                    │            ↓                │
                    │  ┌─────────────────────┐    │
                    │  │     NFR Planning    │    │
                    │  └─────────────────────┘    │
                    │            ↓                │
                    │  ┌─────────────────────┐    │
                    │  │    NFR Generation   │    │
                    │  └─────────────────────┘    │
                    │            ↓                │
                    │  ┌─────────────────────┐    │
                    │  │     Code Planning   │    │
                    │  └─────────────────────┘    │
                    │            ↓                │
                    │  ┌─────────────────────┐    │
                    │  │ Code Generation     │    │
                    │  │ Business → Data →   │    │
                    │  │ Interface Layer     │    │
                    │  └─────────────────────┘    │
                    └─────────────────────────────┘
                                   │
                                   ▼
                    Select next unit or complete
```