# Session Continuity Templates

## Welcome Back Prompt Template
When a user returns to continue work on an existing AI-DLC project, present this prompt:

```markdown
**Welcome back! I can see you have an existing AI-DLC project in progress.**

Based on your aidlc-state.md, here's your current status:
- **Project**: [project-name]
- **Current Phase**: [Phase X: Phase Name]
- **Architecture**: [Single/Multiple/Not yet decided]
- **Last Completed**: [Last completed step]
- **Next Step**: [Next step to work on]

**What would you like to work on today?**

A) Continue where you left off ([Next step description])
B) Review a previous phase ([Show available phases])

[Answer]: 
```

## MANDATORY: Session Continuity Instructions
1. **Always read aidlc-state.md first** when detecting existing project
2. **Parse current status** from the workflow file to populate the prompt
3. **MANDATORY: Load Previous Phase Artifacts** - Before resuming any phase, automatically read all relevant artifacts from previous phases:
   - **Requirements Phase**: Read requirements.md, requirement-verification-questions.md
   - **Story Phase**: Read stories.md, personas.md, story-generation-plan.md
   - **Architecture Phase**: Read architectural-decisions.md
   - **Design Phase**: Read design artifacts (design.md, domain-model.md, etc.)
   - **NFR Phase**: Read NFR plans and setup artifacts
   - **Code Phase**: Read all code files, plans, AND all previous artifacts
4. **Smart Context Loading by Phase**:
   - **Early Phases (1-4)**: Load requirements and story artifacts
   - **Design Phases (5-7)**: Load requirements + stories + architecture + design artifacts
   - **NFR Phases (8-9)**: Load all design artifacts + NFR plans
   - **Code Phases (10-11)**: Load ALL artifacts + existing code files
5. **Adapt options** based on architectural choice and current phase
6. **Show specific next steps** rather than generic descriptions
7. **Log the continuity prompt** in audit.md with timestamp
8. **Context Summary**: After loading artifacts, provide brief summary of what was loaded for user awareness
9. **Asking questions**: ALWAYS ask clarification or user feedback questions by placing them in .md files. DO NOT place the multiple-choice questions in-line in the chat session. 