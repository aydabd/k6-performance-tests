# Git Merge Strategy

## The Golden Rule

> **Every commit on `main` must pass all linting and tests independently.**
>
> This ensures `git bisect` can reliably find the exact commit that broke the code.

## Why This Matters

### What is `git bisect`?

`git bisect` performs a **binary search** through commit history to find the
exact commit that introduced a bug. Instead of checking every commit one by
one (O(n)), it halves the search space each step (O(log n)).

```text
Good commit                                        Bad commit (HEAD)
    |                                                   |
    v                                                   v
    A --- B --- C --- D --- E --- F --- G --- H --- I --- J

Step 1: Test E (midpoint)  → passes  → bug is in F..J
Step 2: Test H (midpoint)  → fails   → bug is in F..H
Step 3: Test F (midpoint)  → passes  → bug is G or H
Step 4: Test G             → fails   → G introduced the bug ✓

Found in 4 steps instead of 10!
```

### Automated bisect

```bash
git bisect start HEAD v2.4.0
git bisect run npm test
# Git automatically finds the first commit where tests fail
```

### Why broken intermediate commits ruin bisect

If commit D adds a feature but its tests arrive in commit G, then bisect may
land on D, run `npm test`, and get a false failure — **bisect points to the
wrong commit**. Every commit must be a self-contained, passing unit.

## Merge Strategies

### Squash and Merge — use when commits are NOT individually tested

All PR commits become **one commit** on `main`.

```text
PR branch:   fix-1 → feat-A → tests-for-A → cleanup
                              ↓ squash
main:        ... → "feat: implement feature A" (single commit, fully tested)
```

**When to use:**

- PR has iterative work-in-progress commits
- Some commits depend on later commits to pass tests
- Fix-up commits exist (e.g., "fix review feedback")

### Rebase and Merge — use when EVERY commit passes independently

All PR commits are replayed onto `main` as individual commits.

```text
PR branch:   feat-A (tested) → feat-B (tested) → feat-C (tested)
                              ↓ rebase
main:        ... → feat-A → feat-B → feat-C (each commit passes CI)
```

**When to use:**

- Each commit is atomic: it adds code AND its tests together
- Each commit passes linting, unit tests, and integration tests on its own
- Commit messages are clean and follow conventional commits

## Decision Flowchart

```text
Does EVERY commit in the PR pass lint + tests independently?
  │
  ├── YES → Rebase and Merge ✓
  │         (preserves granular history, bisect-safe)
  │
  └── NO  → Squash and Merge ✓
            (creates one honest, fully-tested commit)
```

## How We Enforce This

1. **Pre-commit hooks** — lint and conventional commit checks run before each
   local commit (via `mamba-githook`).
2. **CI per-commit check** — the `commit-lint-test` job in CI validates that
   every commit in the PR passes lint and tests. If any commit fails, the PR
   **must** be squash-merged.
3. **PR labels** — CI automatically labels PRs as `squash-merge-required` when
   individual commits fail validation, making the required strategy visible.

## Example: Good vs Bad Commit Sequences

### Bad — must squash

```text
commit 1: feat: add auth module        ← no tests, lint warnings
commit 2: feat: add test case builder  ← no tests
commit 3: test: add tests for commits 1-2  ← tests added after the fact
commit 4: fix: address review feedback ← fixes from commit 1
```

Commits 1–2 would fail `npm test` and `eslint` on their own. **Squash these.**

### Good — safe to rebase

```text
commit 1: feat: add auth module with unit tests    ← passes lint + tests
commit 2: feat: add test case builder with tests   ← passes lint + tests
commit 3: docs: update API documentation           ← passes lint
```

Each commit is self-contained. **Rebase and merge these.**

## For AI Agents

AI coding agents (Copilot, Claude Code, etc.) **must** follow the same rules:

- Each commit must pass `npm test` and lint before pushing.
- If iterating on review feedback, prefer amending the previous commit or
  accept that the PR will be squash-merged.
- Include tests in the same commit as the feature code.
