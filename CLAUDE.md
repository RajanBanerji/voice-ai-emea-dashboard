# CLAUDE.md

## Project Overview

<!-- Brief description of what this project does -->
<!-- Update this section as the project takes shape -->

## Build & Run Commands

<!-- Add commands as they become relevant -->
- **Install dependencies**: `npm install` / `pip install -r requirements.txt`
- **Run dev server**: <!-- e.g., npm run dev -->
- **Build**: <!-- e.g., npm run build -->
- **Run tests**: <!-- e.g., npm test / pytest -->
- **Lint**: <!-- e.g., npm run lint / ruff check . -->
- **Type check**: <!-- e.g., npx tsc --noEmit / mypy . -->
- **Single test**: <!-- e.g., npm test -- --testPathPattern=<name> / pytest <path> -k <name> -->

## Coding Standards

### Style & Formatting

- Use consistent indentation (spaces vs tabs — pick one and stick with it)
- Keep lines under 100 characters where practical
- Use meaningful, descriptive names for variables, functions, and files
- Prefer explicit over clever — readability matters more than brevity

### Patterns & Conventions

- Prefer small, focused functions with a single responsibility
- Handle errors close to where they occur
- Avoid deeply nested code — prefer early returns
- Keep dependencies minimal — don't add a library for something trivial

### What to Avoid

- No commented-out code in commits
- No hardcoded secrets, API keys, or credentials
- No `any` types (TypeScript) or equivalent type-safety escapes without justification
- No unused imports or dead code

## Architecture

<!-- Document key architectural decisions as they are made -->
<!-- Example sections: -->
<!-- ### Directory Structure -->
<!-- ### Key Dependencies -->
<!-- ### Data Flow -->
<!-- ### API Design -->

## Git Conventions

- Write concise commit messages focused on "why" not "what"
- Use conventional commit prefixes when appropriate: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Keep commits atomic — one logical change per commit
