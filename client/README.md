# Nimora Frontend - Next.js 15 App

Modern student portal interface built with Next.js 15, React 19, and TailwindCSS v4.

## Stack

- **Framework:** Next.js 15
- **Runtime:** React 19
- **Styling:** TailwindCSS v4
- **Components:** shadcn/ui
- **State Management:** TanStack Query
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + Playwright
- **Linting:** ESLint 9

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard & features
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── form/              # Form components
│   │   ├── dashboard/         # Dashboard components
│   │   └── layout/            # Layout components
│   ├── utils/
│   │   ├── api.ts             # API client setup
│   │   ├── attendanceService  # Service layer
│   │   └── securityUtils      # Security utilities
│   ├── __tests__/
│   │   ├── e2e/               # Playwright E2E tests
│   │   └── unit/              # Component unit tests
│   └── styles/
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## Setup

### Environment Variables

Create `client/.env.local` from `client/.env.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Optional: CI environment
# CI=true
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# App runs on http://localhost:3000
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint with ESLint
- `pnpm lint:fix` - Fix linting issues
- `pnpm typecheck` - TypeScript type checking
- `pnpm test` - Run unit tests (Vitest)
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Generate coverage report
- `pnpm test:e2e` - Run E2E tests (Playwright)
- `pnpm test:e2e:ui` - Run E2E tests with UI
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts

## Pages & Features

### Authentication

- **`/login`** - Login page
- **`/auth/callback`** - OAuth callback handler

### Dashboard

- **`/dashboard`** - Main dashboard with statistics
- **`/dashboard/attendance`** - Attendance tracking
- **`/dashboard/cgpa`** - CGPA analytics
- **`/dashboard/timetable`** - Timetable view
- **`/dashboard/class-timetable`** - Class timetable (restricted)
- **`/dashboard/internals`** - Internal marks
- **`/dashboard/feedback`** - Feedback submission

## Component Architecture

### UI Components (shadcn/ui)

- Button - Interactive buttons
- Card - Content containers
- Input - Form inputs
- Dialog - Modal dialogs
- Tabs - Tabbed content
- Select - Dropdown menus
- Toast - Notifications
- And more...

### Custom Components

- `Navbar` - Navigation header
- `Sidebar` - Dashboard sidebar
- `Footer` - Page footer
- `AuthGuard` - Route protection
- `LoadingSpinner` - Loading state
- `ErrorBoundary` - Error handling

## Styling

### TailwindCSS v4

- Utility-first CSS framework
- Custom theme colors
- Responsive design
- Dark mode support
- CSS variables integration

### Color Scheme

- **Primary:** Blue (#1173d4)
- **Secondary:** Cyan/Blue accents
- **Neutral:** Gray scale for UI
- **Semantic:** Green (success), Red (error), Yellow (warning)

## API Integration

### Axios Client Setup

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"),
});

// Interceptors for auth, error handling, etc.
```

### TanStack Query

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["attendance"],
  queryFn: async () => {
    const { data } = await api.post("/attendance", {
      rollNo: userRollNo,
    });
    return data;
  },
});
```

## Testing

### Unit Tests (Vitest)

```bash
pnpm test                    # Run all tests
pnpm test run                # Run once (CI mode)
pnpm test:coverage           # With coverage report
```

Tests for:

- Components (shadcn/ui)
- Custom hooks
- Utility functions
- Form validation

### E2E Tests (Playwright)

```bash
pnpm test:e2e                # Run E2E tests
pnpm test:e2e:ui             # With browser UI
```

Tests cover:

- Login flow
- Dashboard navigation
- Data display
- Form submission
- Error handling
- Accessibility

**Note:** E2E tests are skipped in CI (`CI=true`). Run locally with both servers running.

## Performance Optimization

### Build Optimization

- Code splitting per route
- Image optimization (AVIF/WebP)
- SWC minification
- Tree shaking

### Runtime Optimization

- React Server Components
- Incremental Static Regeneration (ISR)
- Image lazy loading
- Request memoization via TanStack Query

### Results

- ✅ 259 kB First Load JS
- ✅ All 13 pages pre-rendered
- ✅ < 3 seconds Time to Interactive
- ✅ Lighthouse score > 90

## Security

### Best Practices

- ✅ Content Security Policy
- ✅ HTTPS enforcement
- ✅ Secure cookies
- ✅ Input validation
- ✅ XSS prevention
- ✅ CSRF tokens
- ✅ No sensitive data in localStorage
- ✅ API key rotation support

### Environment Handling

- No secrets in code
- All URLs from environment
- API credentials in HTTP-only cookies
- Token refresh automatic

## Deployment

### Vercel (Recommended)

```bash
# Connect GitHub repository
# Automatic deployments on push

# Environment variables set in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.nimora.app
# NEXT_PUBLIC_API_TIMEOUT=60000
```

### Docker

```bash
# Build
docker build -f Dockerfile -t nimora-client .

# Run
docker run -e NEXT_PUBLIC_API_URL=... -p 3000:3000 nimora-client
```

### Docker Compose

```bash
docker-compose up -d
# App available at http://localhost:3000
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**API connection fails**

```bash
# Check backend is running
curl http://localhost:3001/api/health

# Verify NEXT_PUBLIC_API_URL in .env.local
```

**Build fails**

```bash
# Clear cache and rebuild
pnpm clean && pnpm build
```

**Tests fail**

```bash
# Clear test cache
pnpm test -- --clearCache

# Run specific test
pnpm test -- attendance.test.tsx
```

**Port already in use**

```bash
# Use different port
pnpm dev -- -p 3001
```

## Development Tips

### Code Style

- Use TypeScript strictly
- Follow ESLint rules
- Format with Prettier
- Component naming: PascalCase
- Function naming: camelCase
- Constants: UPPER_CASE

### Git Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -m 'feat: description'`
3. Push and open PR: `git push origin feature/name`
4. Husky will run linting automatically

### Useful Commands

```bash
# Format code
pnpm lint:fix

# Type check
pnpm typecheck

# Run linter
pnpm lint

# Clean node_modules
rm -rf node_modules && pnpm install
```

## License

MIT - See [LICENSE](../LICENSE) for details.
