# Contributing to Nimora

Thank you for your interest in contributing to Nimora! This guide will help you understand our development process and how to make effective contributions.

## Code of Conduct

Be respectful, inclusive, and professional. Harassment or discrimination will not be tolerated.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 17+ (for local testing)
- Git

### Development Setup

1. **Fork the repository**

   ```bash
   # Visit https://github.com/mdaashir/Nimora
   # Click "Fork" in the top-right corner
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Nimora.git
   cd Nimora
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/mdaashir/Nimora.git
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Setup environment variables**

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env.local
   # Edit .env files with your local configuration
   ```

6. **Generate Prisma Client**

   ```bash
   cd server && pnpm prisma:generate
   ```

7. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

8. **Start development**
   ```bash
   pnpm dev
   ```

## Development Workflow

### Before Making Changes

- Check existing issues and pull requests
- Open an issue if you want to work on something significant
- Discuss your approach in the issue before starting

### Making Changes

1. **Follow the project structure**
   - Keep code organized in logical modules
   - Use TypeScript strictly
   - Follow naming conventions

2. **Code Style**
   - Use ESLint: `pnpm lint`
   - Format with Prettier: `pnpm format`
   - Follow existing code patterns

3. **Write Tests**
   - Unit tests for new features
   - Update tests when modifying existing code
   - E2E tests for user flows

   ```bash
   # Run tests locally
   pnpm test:frontend
   pnpm test:backend
   ```

4. **Type Safety**
   ```bash
   # Run typecheck
   pnpm typecheck
   ```

### Git Commit Guidelines

Use conventional commits for clear history:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, semicolons, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Test additions/changes
- `chore:` - Build/dependency changes

**Examples:**

```bash
git commit -m "feat(auth): add email verification"
git commit -m "fix(attendance): handle empty response correctly"
git commit -m "docs: update installation guide"
git commit -m "refactor(cache): improve Redis configuration"
```

## Pull Request Process

1. **Update your fork**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push changes**

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Title: Clear, descriptive, follows conventional commits
   - Description: Explain what, why, and how
   - Link related issues: `Closes #123`
   - Include testing notes

4. **PR Description Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## How Has This Been Tested?

   - [ ] Unit tests
   - [ ] E2E tests
   - [ ] Manual testing

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests pass locally
   ```

5. **Code Review**
   - Respond to review comments promptly
   - Make requested changes in new commits
   - Request re-review when ready
   - Be respectful and collaborative

6. **Merge**
   - Maintainers will merge when approved
   - Squash or rebase at maintainer's discretion

## Development Guidelines

### Backend (NestJS)

**Structure:**

- One module per feature
- Services for business logic
- Controllers for HTTP endpoints
- DTOs for request/response
- Interfaces for type definitions

**Example:**

```typescript
// Feature module
src/features/attendance/
├── dto/
│   └── attendance.dto.ts
├── interfaces/
│   └── attendance.interface.ts
├── attendance.controller.ts
├── attendance.service.ts
└── attendance.module.ts
```

**Best Practices:**

- Use dependency injection
- Implement proper error handling
- Add Swagger documentation
- Validate input with DTOs
- Handle async operations with async/await

### Frontend (Next.js)

**Structure:**

- Pages in `app/` using App Router
- Reusable components in `components/`
- Utilities and hooks in `utils/`
- API calls through service layer

**Example:**

```typescript
// Component structure
src/components/
├── ui/                    # shadcn/ui components
├── dashboard/             # Feature components
│   └── StatCard.tsx
└── layout/                # Layout components
    └── Navbar.tsx
```

**Best Practices:**

- Use Server Components when possible
- Implement error boundaries
- Lazy load heavy components
- Use Next.js Image optimization
- Follow React best practices
- Use Zod for validation

### Database (Prisma)

**Schema:**

- One model per entity
- Clear relationships
- Proper indexes
- Comments for complex logic

**Migrations:**

```bash
# Create migration
pnpm prisma:migrate:dev --name add_new_field

# Deploy to production
pnpm prisma:migrate:deploy
```

**Best Practices:**

- Use relations properly
- Add unique/indexed fields
- Include timestamps (createdAt, updatedAt)
- Document complex schemas

## Testing Guidelines

### Unit Tests

```typescript
// Backend (Jest)
describe("AttendanceService", () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AttendanceService],
    }).compile();
    service = module.get<AttendanceService>(AttendanceService);
  });

  it("should fetch attendance", async () => {
    const result = await service.getAttendance("22PT001");
    expect(result).toBeDefined();
  });
});
```

```typescript
// Frontend (Vitest)
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// Playwright
import { test, expect } from "@playwright/test";

test("login flow", async ({ page }) => {
  test.skip(!!process.env.CI, "Skip in CI");

  await page.goto("/login");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
});
```

## Common Issues

### Database Connection Error

```bash
# Ensure PostgreSQL is running
psql $DATABASE_URL

# Check .env file
cat server/.env
```

### Prisma Client Not Found

```bash
cd server && pnpm prisma:generate
```

### Port Already in Use

```bash
# Change port in .env
PORT=3002
```

### ESLint/Format Issues

```bash
# Auto-fix
pnpm lint:fix

# Format
pnpm format
```

## Documentation

- Update README.md for significant changes
- Add inline comments for complex logic
- Document APIs in Swagger
- Update CHANGELOG.md

## Performance Considerations

- Minimize bundle size
- Cache expensive operations
- Optimize database queries
- Use pagination for large datasets
- Implement rate limiting

## Security Considerations

- Never commit secrets or credentials
- Use environment variables
- Validate and sanitize inputs
- Escape outputs properly
- Follow OWASP guidelines
- Report security issues privately

## Questions or Need Help?

- Open an [issue](https://github.com/mdaashir/Nimora/issues)
- Start a [discussion](https://github.com/mdaashir/Nimora/discussions)
- Check existing documentation

## Recognition

Contributors will be recognized in:

- GitHub contributors page
- Release notes
- Project acknowledgments

Thank you for contributing to Nimora! 🎉
