# Changelog

All notable changes to this project will be documented here.

## [0.1.3] — 2026-10-17

### Changed

- Plugin display name is now "VaultRecall Spaced Repetition"; command palette entries use this prefix.
- Minimum Obsidian version is now 1.4.4 (required by the frontmatter cleanup command).
- Settings are registered with Obsidian's declarative settings API, so they appear in settings search on Obsidian 1.13+. Older versions keep the existing settings page.
- Renaming the default review folder (or a parent folder) now updates the default folder setting.
- Numeric settings use number inputs; "Clear API key" is now an icon button on the API key row.

### Fixed

- AI quiz: API error responses now report their HTTP status instead of a generic failure.
- AI quiz: non-JSON API responses show a clear error.
- AI quiz: the 30-second timeout no longer leaves an unhandled promise rejection after every request.
- Rating or undoing while a previous rating is still saving no longer races; ending a session mid-save no longer shows a false "rating failed" notice.
- Releases now ship `main.js`, `manifest.json`, and `styles.css` as release assets.

## [0.1.2]

### Added

- "Start AI quiz on this note" in the file context menu.
- Keyboard rating (`1`–`4`) inside the AI quiz modal.

### Fixed

- Issues raised by the Obsidian community plugin review.

## [0.1.0] — 2026-05-07

Beta release. Errors may occur; please report issues at https://github.com/chrisnmorrison/vaultrecall-sr/issues for VaultRecall SR.

### Added

- Navigate Mode: sequential note review with SM-2 spaced repetition scheduling
- AI Quiz Mode: on-demand question generation via any OpenAI-compatible API (BYOK)
- Floating review HUD with Again / Hard / Good / Easy rating buttons
- Keyboard shortcuts `1`–`4` for rating during sessions
- Notes open in reading mode during review so keyboard shortcuts never type into content
- "Edit note" button in the HUD to switch back to edit mode when needed
- Settings: default folder, review order (due-date first or random), daily review limit
- Internal review persistence in `.obsidian/plugins/vaultrecall/data.json`; legacy frontmatter import and cleanup commands are available
- Right-click context menu on folders to start a review or AI quiz session
- Ribbon icon for one-click access to the default folder session
