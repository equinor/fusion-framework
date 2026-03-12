# Changelog

## 0.1.1 - 2026-03-05

### patch

- [#55](https://github.com/equinor/fusion-skills/pull/55) [`2d346c8`](https://github.com/equinor/fusion-skills/commit/2d346c812b4927ed1fdf17c92d51856d1fdc09c3) - Add required ownership metadata (`metadata.owner`, `metadata.status`) to all skills. Owner is set to `@equinor/fusion-core` (repository default) and status is set according to skill lifecycle (`active` for production skills, `experimental` for early-stage skills). Sponsor metadata was considered but is not required for MVP.


  resolves equinor/fusion-core-tasks#474

## 0.1.0 - 2026-02-23

### minor

- [#28](https://github.com/equinor/fusion-skills/pull/28) [`443ec19`](https://github.com/equinor/fusion-skills/commit/443ec197e8a6e9705cf471f29fd0b4400b79c081) - Add a new skill that self-reports Fusion skill workflow failures into a structured local bug draft with explicit confirmation gates before any GitHub mutation.


  resolves equinor/fusion-core-tasks#403
