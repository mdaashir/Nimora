# Testing Guide - Nimora Student Portal

## Overview

Comprehensive testing setup with unit tests, component tests, and E2E tests.

---

## Running Tests

### All Tests
```bash
pnpm test
```

### Backend Unit Tests (Jest)
```bash
pnpm test:backend

# Watch mode
pnpm --filter @nimora/backend test:watch

# With coverage
pnpm --filter @nimora/backend test:cov
```

**Coverage:** 27 tests covering authentication, services, and utilities

### Frontend Component Tests (Vitest)
```bash
pnpm test:frontend

# Watch mode
pnpm --filter @nimora/frontend test

# UI mode
pnpm --filter @nimora/frontend test:ui

# With coverage
pnpm --filter @nimora/frontend test:coverage
```

**Test Suites:**
- Button component tests
- Card component tests
- Input component tests

### E2E Tests (Playwright)
```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific browser
pnpm test:e2e --project=chromium

# Debug mode
pnpm test:e2e --debug
```

**Test Suites:**
- Login page tests (redirect, form validation, accessibility)
- Accessibility tests (responsive design, performance)

### Coverage Reports
```bash
# Generate coverage for all packages
pnpm test:coverage
```

Coverage reports are generated in:
- Backend: `apps/backend/coverage/`
- Frontend: `apps/frontend/coverage/`

---

## Test Structure

### Backend Tests (`apps/backend/src/**/*.spec.ts`)
```
apps/backend/src/
├── auth/
│   ├── auth.service.spec.ts
│   └── crypto.service.spec.ts
├── users/
│   └── users.service.spec.ts
└── ... (other modules)
```

### Frontend Tests (`apps/frontend/src/**/*.test.tsx`)
```
apps/frontend/src/
├── components/
│   └── ui/
│       ├── button.test.tsx
│       ├── card.test.tsx
│       └── input.test.tsx
└── test/
    └── setup.ts
```

### E2E Tests (`e2e/**/*.spec.ts`)
```
e2e/
├── login.spec.ts
└── accessibility.spec.ts
```

---

## Writing Tests

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nimora/);
});
```

---

## CI/CD Integration

Tests are configured for CI/CD pipelines:
- Playwright retries on failure in CI
- Parallel execution disabled in CI for stability
- HTML reports generated for review

---

## Best Practices

1. **Run tests before committing**
2. **Write tests for new features**
3. **Maintain >80% coverage**
4. **Use descriptive test names**
5. **Test edge cases**
6. **Keep tests independent**

---

## Troubleshooting

### Vitest Issues
- Clear cache: `pnpm --filter @nimora/frontend test --clearCache`
- Update snapshots: `pnpm --filter @nimora/frontend test -u`

### Playwright Issues
- Install browsers: `pnpm exec playwright install`
- Show trace: `pnpm exec playwright show-trace trace.zip`

### Coverage Not Showing
- Ensure coverage provider is installed: `@vitest/coverage-v8`
- Check vitest.config.ts settings

---

For more details, see:
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
