---
name: game-localization-vi
description: Generic, game-agnostic workflow for translating a video game into Vietnamese or re-editing an existing Vietnamese translation (Việt hóa game, dịch game, biên tập lại bản Việt hóa, sửa xưng hô, sửa câu dịch máy) — research the story first, write a per-game style guide and character bible, edit in scene-ordered batches with a tiered team of subagents (lead → up to 5 coordinators → cheap worker models for simple lines only), validate subtitle timings/tags/placeholders automatically, run a consistency pass, then rebuild and install. Use this skill whenever the user wants to localize, translate, retranslate, proofread or fix a Vietnamese game translation (or any large dialogue/subtitle/UI string set), complains about wrong pronouns, machine-translation style or inconsistent terms in a game translation, or asks to continue such a project — even if they only say "dịch tiếp", "Việt hóa game X" or "sửa bản dịch".
---

# Game localization into Vietnamese — a process, not a phrasebook

This skill describes **how** to run a game translation or re-edit. It deliberately does **not** decide how any particular game is translated. Every game has its own world, relationships, tone and terminology: pronoun pairs, which names stay in the source language, how documents sound, how a monster or an AI talks — all of that is decided per game from research and written into that game's style guide. Nothing in this skill should be copied into a game's guide as a fixed rule unless the research for that game supports it.

Why the process matters: Vietnamese pronouns encode age, gender, kinship, rank and attitude, and Vietnamese separates spoken and written register sharply. A translation fails when the editor does not know **who is speaking to whom** and **what kind of text** a line is. So research comes before editing, decisions are written down once, editors see each line inside its scene, and cheap models stay away from lines that need story context.

## Phases

| # | Phase | Output |
|---|---|---|
| 0 | Scope, backups, workspace | `WORK/` with the tools copied in; backups of every game file that will be replaced |
| 1 | Corpus | `corpus.jsonl` (+ duplicate map) and a proven identity round-trip |
| 2 | **Story research** (mandatory, before any editing) | `research_story.md`, `character_bible.md` |
| 3 | Style guide for this game | `STYLE_GUIDE.md` |
| 4 | Batches | `B/*.txt`, `B/manifest.json` |
| 5 | Tiered editing | `E/<batch>.*.jsonl` |
| 6 | Supervision | validated batches, guide additions, `followups.txt` |
| 7 | Consistency pass | `final.json` |
| 8 | Rebuild, verify, install | game files + a dated backup copy |

Keep everything a later session needs in `WORK/` (not a temp dir) and leave a short progress note (memory or `WORK/README`): large projects get interrupted by usage limits and by game updates.

## 0 — Scope and safety
- Find out: the game, engine, install path, where the text lives, whether a Vietnamese translation already exists (edit) or not (fresh), how the game picks its language (mods often replace the English slot), whether a font with Vietnamese diacritics is needed.
- Back up every file you will overwrite before touching anything. Ask the user before installing; the game must be closed (check the process list).
- Note what your harness offers (subagents? parallel runs? model choice per agent? web search/fetch? shell + Node?). Phase 2 needs web access or the user's help with sources; Phase 5 picks a mode from it.
- Create `WORK/`, copy `scripts/*.js` into it, and copy `assets/AGENT_TASK.md` + `assets/COORDINATOR.md` (replace `<WORK>` with the absolute path). Tools run as `cd WORK && node <tool>.js`, which is also how editors call them. Node.js is assumed; check before relying on Python.

## 1 — Corpus
Write an engine-specific reader that turns every translatable string into one line of `corpus.jsonl` (schema and engine advice: `references/game-formats.md`):
```json
{"id":"…","kind":"dlg|choice|text","en":"source text","vi":"current translation or empty","speaker":"…","scene":"…","order":3,"key":"…"}
```
- `scene` + `order` restore conversation order — the most useful thing you can give an editor. Look for cutscene/sequence files, conversation ids, or line ids that interleave speakers.
- Lines stored more than once (subtitle table + cutscene file, identical barks per character) are batched once; mark copies with `dupOf` or a `link.json` map so the edit propagates.
- Before editing anything, prove that rebuilding from the unmodified corpus reproduces the installed files (or decodes to identical content).

## 2 — Story research (always first)
Run in parallel (prompts in `references/research.md`):
1. **Web research** on reliable, bot-crawlable sources (wikis, Wikipedia, official blogs, walkthrough sites, reviews): plot, endings, characters, relationships, glossary, tone.
2. **Game-text mining** of the corpus: pronouns and titles used about each character, kinship words, ages, who addresses whom and how. The game text outranks web guides.

Merge into `character_bible.md`: for each character, gender, age band, role, relationships, attitude, speech register and recommended Vietnamese pronoun pairs with the reason. List characters whose gender cannot be established as **unknown gender**.

## 3 — Style guide for this game
Fill `assets/STYLE_GUIDE_template.md` into `WORK/STYLE_GUIDE.md` from the research: story summary, the pronoun table **for this game's relationships**, glossary (what stays in the source language vs gets translated — decided per game), register notes for this game's text types, and 8–12 before/after examples taken from this game's corpus. The template contains only general Vietnamese writing guidance and the technical rules; everything game-specific stays blank until research fills it.

Principles every guide keeps (they are about method, not content):
- Spoken register for spoken lines (dialogue, choices, barks, radio); written register for written text (documents, UI, tutorials, item text, logs). Which text types exist and how each should sound is game-specific.
- Pronouns follow speaker → listener and stay consistent within a scene.
- **Unknown gender → no gendered pronoun.** Use the name, a title or role, "người đó", or drop the subject (natural in Vietnamese). Never guess.
- Technical tokens (timing marks, markup tags, variables, escape sequences) are preserved exactly; the validator enforces it.
- One source of truth: when the guide and the bible disagree, fix them so they agree; the guide wins meanwhile.

## 4 — Batches
`LIMIT=15000 node build_batches.js`: about 15k source characters per batch gives enough scene context while keeping an editor careful to the end. Dialogue follows scene order; text is grouped by key prefix or `group`. Adjust LIMIT to the material.

## 5 — Editing (tiered team when the harness allows it)
First check what your harness can do and pick a mode. Details, prompts and per-harness notes: `references/orchestration.md`.

| Mode | Harness capability | How to run |
|---|---|---|
| **A — tiered team** | can start subagents, run several at once, choose a model per subagent | lead → up to 5 coordinators → workers (cheapest model) for simple lines |
| **B — flat team** | subagents, but no per-agent model choice or no nesting | lead → up to 5 editors on the same model; editors handle simple and hard lines themselves |
| **C — single agent** | no subagents | you edit batches one by one, in order, saving after each batch; or the user opens several sessions/terminals, each given a batch list |

Roles in mode A:
- **Lead (you, strongest model):** research, guide, batching, assignment, supervision, consistency, packaging. The lead does not edit batches.
- **Coordinators (mid-tier models), at most 5.** Each owns a set of batches balanced by difficulty, edits the hard material itself, delegates simple material to workers, and reviews every worker line.
- **Workers (the cheapest model available, e.g. Haiku, Luna, a "mini"/"flash" model)**, started by coordinators, at most 3 per coordinator, **simple lines only**: short UI/menu text, item names, barks, stat/ability descriptions, short choices that carry no relationship-dependent pronoun. Never story dialogue.

In every mode, editors write `E/<batch>.partN.jsonl` (≤120 lines per file, `{"id","vi"}` for every id); later files override earlier ones. All coordination goes through files in `WORK/` — `STYLE_GUIDE.md` (with its additions table), `character_bible.md`, `followups.txt`, `E/` — so it works even where agents cannot message each other. After an interruption, `node missing.js <batch>` lists what is left; resume with "edit only the missing ids".

Put the strongest editor on story-critical dialogue, where quality is won or lost; cheap models on UI save most of the cost.

## 6 — Supervision
- When a batch is reported done, run `node validate.js <batch>` (missing 0, no timing/tag/placeholder/empty errors) and `node show.js <batch> 30` to read a sample (EN / OLD / NEW).
- Editors report decisions and doubts. Decide, write the decision into the guide's additions table, align the bible, and — if your harness lets you message running agents — tell the affected ones; otherwise agents pick it up because they re-read the additions table before each batch. Cross-batch fixes you cannot apply yet go to `followups.txt`.
- `node status.js` shows progress. On usage-limit or rate-limit errors, stop starting new work, tell the user, and resume later.

## 7 — Consistency pass
Run `node finalize.js` (merge edits, reject invalid lines, propagate copies), then `node postfix.js --report`, write `postfix.rules.js` from `assets/postfix.rules.template.js`, and run `node postfix.js`. Keep rules narrow (prefer conditions on the source text) because many report hits are legitimate uses of a word. Every changed line is re-validated.

## 8 — Rebuild, verify, install
Build into a fresh folder and verify that every rebuilt entry equals `final.json` and untouched game entries are unchanged. Back up the installed files, install with the game closed, compare hashes, and keep a dated copy. Tell the user what changed, what was not done, where the backups are, and that game updates may overwrite index files (procedure in `references/game-formats.md`).

## Bundled files
- `references/research.md` — bot-friendly sources, what to extract, research and bible prompts.
- `references/orchestration.md` — team structure, coordinator/worker/resume prompts, limits, supervision checklist, lessons.
- `references/game-formats.md` — corpus schema, finding text, identity round-trip, fonts, game updates.
- `assets/STYLE_GUIDE_template.md` — guide skeleton (general Vietnamese guidance and technical rules; game parts blank).
- `assets/AGENT_TASK.md`, `assets/COORDINATOR.md` — task files for editors.
- `assets/postfix.rules.template.js` — skeleton for the consistency rules.
- `scripts/` — `build_batches.js`, `validate.js` (optional `validate.config.json`), `split.js`, `vchunk.js`, `missing.js`, `show.js`, `status.js`, `finalize.js`, `postfix.js`.
