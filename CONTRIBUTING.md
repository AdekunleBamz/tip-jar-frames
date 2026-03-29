# Contributing to Tip Jar Frames

Thank you for your interest in contributing to Tip Jar Frames! 💜

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A wallet with ETH on Base (for testing)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tip-jar-frames.git
   cd tip-jar-frames
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branches

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `chore/*` - Maintenance tasks

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run linting:
   ```bash
   npm run lint
   ```
4. Run tests:
   ```bash
   npm run test
   ```
5. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Requests

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill out the PR template
4. Wait for review

### Code Review

- All PRs require at least one approval
- Address feedback promptly
- Keep PRs focused and atomic

## Smart Contract Development

### Testing Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test
```

### Deploying Contracts

See the [README](README.md) for deployment instructions.

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic

## Questions?

Feel free to open an issue for any questions or concerns.

---

Thank you for contributing! 💜
