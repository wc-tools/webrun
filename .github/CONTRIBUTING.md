# Contributing to @wc-tools/webrun

Thank you for your interest in contributing! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory for detailed contribution guidelines.

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone git@github.com:YOUR_USERNAME/webrun.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make your changes and add tests
6. Run tests: `pnpm test`
7. Run linter: `pnpm lint`
8. Add a changeset: `pnpm changeset`
9. Commit and push your changes
10. Open a pull request

## Adding a Changeset

We use changesets to manage versioning and changelogs. After making your changes:

```bash
pnpm changeset
```

Follow the prompts to:
1. Select the type of change (major, minor, patch)
2. Describe your changes

This creates a changeset file that will be used to generate the changelog and bump the version when your PR is merged.
