# Project Context

Project ID: d586c716-6ce5-475f-b589-9f495ea4ef5d

## Workspace
This is a git worktree on its own branch, not the project's shared checkout: commit freely, nothing you write reaches another session.
The declared toolchain lives in `devenv.nix` and is NOT active in this shell. To run or build the project with it, prefix the command: `devenv shell -- <cmd>`. Realization starts warming when this workspace boots, so the first call may still block for a minute; it is cached afterwards. Prefer it over hand-rolling a virtualenv or installing packages globally.
Outside the devenv the image provides python3, node and bun.

## Preview Environments

You have access to preview deployment tools. When building full-stack
applications (frontend + backend + database/cache/queue), use the
`deploy_preview` tool to deploy your docker-compose.yml and get a live URL.

**Workflow:**
1. Write your application code
2. Write a docker-compose.yml for the full stack
3. Call `deploy_preview` with the compose content
4. Test your APIs with `curl` against the preview URL
5. Check logs with `preview_logs` if something fails
6. Iterate: edit code, call `deploy_preview` again
7. Include the preview URL when presenting work to the user

See `.claude/skills/preview-deploy/SKILL.md` for detailed examples and best practices.