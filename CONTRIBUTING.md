# Contributing

Thanks for your interest in contributing to Digital Tricks Restaurantes.

This project is being prepared for broader open source collaboration, so the
best contributions right now are bug fixes, documentation improvements, test
coverage, and focused feature work aligned with the current product flow.

## Before You Start

- Read the main [README](README.md) for local setup and project context.
- Open an issue before starting large changes.
- Prefer small, reviewable pull requests.
- Avoid mixing refactors with feature work unless the refactor is required.

## Development Guidelines

- Keep the customer flow stable: catalog, cart, checkout, and orders are
  priority paths.
- Do not commit secrets, production tokens, or private credentials.
- Update docs when behavior changes.
- Add or update tests when touching critical business logic.
- Preserve existing user changes in unrelated files.

## Pull Request Checklist

- The change has a clear goal.
- The diff is scoped and understandable.
- Local build or relevant checks were run.
- New environment variables are documented.
- UI changes include enough context for reviewers.

## Reporting Bugs

When opening a bug report, include:

- expected behavior
- actual behavior
- reproduction steps
- affected area: frontend, backend, dashboard, checkout, fidelity, etc.
- logs or screenshots if relevant

## Suggesting Features

Feature suggestions are welcome, especially around:

- restaurant operations
- order lifecycle
- dashboard usability
- checkout reliability
- fidelity and retention flows

Please describe the business problem, not only the proposed implementation.

## Code Style

- Prefer clear, direct code over clever abstractions.
- Keep behavior changes close to the domain they affect.
- Reuse existing project patterns when possible.
- Avoid introducing new dependencies without a strong reason.

## Security

If you find a security issue, avoid posting sensitive details publicly in a
regular issue. Share the risk description privately with the maintainers first.
