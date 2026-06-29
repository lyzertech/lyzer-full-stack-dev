# Lyzer Development Workflow Skill

This skill automates the development workflow for Lyzer full-stack project by automatically checking and applying project rules.

## When to Use This Skill

Use this skill automatically when:
- Creating new pages or components
- Adding new modules or features
- Implementing any UI elements
- Working with backend modules

## What This Skill Does

1. **Auto-checks documentation:**
   - Reads `frontend/docs/NAMING_CONVENTIONS.md`
   - Reads `frontend/docs/UI_RULES.md` 
   - Checks `.cursorrules` for backend architecture
   - Reviews existing similar components for patterns

2. **Auto-applies rules:**
   - Correct folder structure and naming
   - Proper component patterns
   - Backend modular architecture
   - UI consistency patterns

3. **Provides context:**
   - Explains which rules are being followed
   - Shows the reasoning behind implementation choices
   - Ensures consistency across the project

## Implementation Process

```
1. User requests new feature/page
2. Auto-read relevant documentation files
3. Analyze existing similar implementations
4. Apply rules and patterns automatically
5. Implement with explanations
6. Verify against project standards
```

This ensures every new development follows established patterns without manual rule checking.