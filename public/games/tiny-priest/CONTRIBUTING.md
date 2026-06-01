# Contributing

Thanks for contributing to Tiny Priest.

## Development workflow

1. Create a feature branch from `main`.
2. Keep changes scoped to a single concern when possible.
3. Run quality checks before opening a PR:
    - `npm run lint`
    - `npm test`
    - `npm run format`
4. Open a pull request with:
    - What changed
    - Why it changed
    - How it was tested

## Coding guidelines

- Prefer readable, small functions over dense logic blocks.
- Keep UI behavior and rendering logic separated where practical.
- Preserve accessibility: keyboard support, labels, and visible focus states.
- Avoid large unrelated refactors in bug-fix PRs.
