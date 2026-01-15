# CI/CD & Git Workflow

## CI/CD Pipelines

Minimal, essential CI/CD with GitHub Actions:

### Test Pipeline (.github/workflows/test.yml)
Runs on every push and pull request:
- **Lint** - ESLint and code standards
- **TypeScript** - Type checking
- **Unit Tests** - Backend (Jest), Frontend (Vitest)
- **E2E Tests** - Playwright integration tests
- **Security** - Dependency scanning

```bash
# Automated checks on pull request
✓ Lint
✓ Type Check
✓ Unit Tests (Backend/Frontend)
✓ E2E Tests
```

### Security Pipeline (.github/workflows/security.yml)
Weekly security audits:
- Dependency vulnerability scanning
- CodeQL code analysis
- Automated security reports

## Pre-Commit Hooks

Automatic code formatting and linting before commits:

### Setup
```bash
pnpm install
pnpm prepare  # Installs Husky hooks
```

### What Runs on Commit
Automatically via `lint-staged`:
- ESLint fix on `.ts`, `.tsx`, `.js`, `.jsx`
- Prettier format on all files
- No commit allowed if linting fails

### Manual Commands
```bash
# Format all code
pnpm format

# Lint all code
pnpm lint

# Run tests
pnpm test
```

## Workflow Files

```
.github/workflows/
├── test.yml          # Testing & quality checks
└── security.yml      # Security scanning

.husky/
└── pre-commit        # Git hook configuration

.lintstagedrc         # Lint-staged rules
```

## Configuration Files

- **eslint.config.js** - Linting rules
- **.lintstagedrc** - Pre-commit hook patterns
- **playwright.config.ts** - E2E test config
- **vitest.config.ts** - Component test config

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   ```bash
   # Code is auto-formatted on commit
   ```

3. **Commit**
   ```bash
   git add .
   git commit -m "feat: description"  # Pre-commit hooks run
   ```

4. **Push & Create PR**
   ```bash
   git push origin feature/my-feature
   ```

5. **Automated checks run**
   - GitHub Actions test pipeline
   - Security scanning
   - Code review

6. **Merge**
   ```bash
   # After all checks pass
   git merge feature/my-feature
   ```

## No Build/Deploy in CI

Build and deployment are handled locally or via Docker:

```bash
# Local build
pnpm build

# Docker deployment
docker-compose up -d
```

This keeps CI fast and focused on code quality.
