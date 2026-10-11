# Orchestration — team modes, prompts, supervision

Everything here is coordinated **through files in `WORK/`** (style guide, bible, batch files, `E/` outputs, `followups.txt`). That is what makes the workflow portable: any harness that can read/write files and run Node can follow it, with or without subagents.

## 1. Pick a mode from your harness's capabilities

| Mode | Needs | Shape |
|---|---|---|
| **A — tiered team** | subagents, several in parallel, model choice per subagent, subagents may start subagents | Lead → ≤5 coordinators (mid tier) → ≤3 workers each (cheapest tier, simple lines only) |
| **A′ — two-level tiered** | subagents with model choice, but no nesting | Lead starts coordinators for hard batches **and** workers directly for simple chunks; coordinators review worker chunks of their batches, or the lead does |
| **B — flat team** | subagents, no model choice | Lead → ≤5 editors on the same model, each owns a batch list and does hard and simple lines itself |
| **C — single agent** | no subagents | Lead edits batch after batch, validating and saving after each. Optional manual parallelism: the user opens several sessions/terminals, each told "you own batches X–Y, follow AGENT_TASK.md" |

Rules that hold in every mode:
- At most **5** agents directly under the lead; at most **3** workers under a coordinator.
- **Workers only get simple lines**: short UI/menu text, item/outfit/weapon names, combat barks, stat/talent descriptions, test/task strings, short choices with no relationship-dependent pronoun. Never story dialogue whose pronouns depend on who speaks to whom.
- Story-critical dialogue goes to the strongest editor available.
- If you cannot choose models, say the tier in the prompt anyway ("you are a worker: only simple lines"), so the division of labour still holds.

### Harness notes (verify against your version — these features change often)
| Harness | Skill location (typical) | Subagents / parallel work | Likely mode |
|---|---|---|---|
| Claude Code | `~/.claude/skills/`, `.claude/skills/` or plugin marketplace | subagent tool with `model` (e.g. opus/sonnet/haiku), background runs with completion notices, messages to running agents | A |
| Cursor (2.4+) | `.cursor/skills/` (check docs) | parallel subagents with their own context; custom subagents can set model and tools | A or A′ |
| VS Code + GitHub Copilot | `.github/skills/`, `~/.copilot/skills/` (also reads `.claude/skills/` per some sources) | custom agents (`*.agent.md`) and delegation from a coordinator agent | A′ or B |
| OpenAI Codex (CLI/IDE/app) | `.agents/skills/` or `~/.agents/skills/` (check docs) | depends on version; if no subagents, run several sessions manually | B (manual) or C |
| Hermes Agent | `~/.hermes/skills/` | check its delegation features | B or C |
| Anything else with Agent Skills | its skill folder | — | C at minimum |

No web tools? Ask the user for wiki links or pasted summaries in Phase 2, and lean harder on mining the game text.

## 2. Assigning batches
Balance by **difficulty**, not batch count: each coordinator/editor gets a mix of hard material it edits itself (story scenes, long documents, quest logs) and easy material (menus, item lists, barks, short choices) it hands to workers in mode A. Give per-batch notes: content type, who speaks to whom, decisions already fixed elsewhere that must be matched (point to the exact `E/` file). Use 1–5 coordinators depending on remaining work and the user's quota.

## 3. Concurrency, quota, interruptions
- Harnesses cap concurrent subagents and accounts have usage limits; hitting a limit can stop every running agent at once. Partial `E/` files survive. Fewer parallel agents do not reduce total cost but reduce what is lost when a limit hits.
- Cost scales with tokens read: every agent re-reads the guide, the bible sections it needs and its batch. Keep the guide compact; let cheap models do the bulk of easy lines.
- On limit errors: stop starting work, tell the user, resume later with the resume prompt.

## 4. Files handed to agents
Copy `assets/AGENT_TASK.md` and `assets/COORDINATOR.md` into `WORK/` and replace `<WORK>` with the absolute path. The scripts are copied into `WORK/` too, so every agent runs `cd "<WORK>" && node <tool>.js ...`.

## 5. Prompt templates
Replace `<…>`. "Start a subagent" means whatever your harness uses (a subagent tool, a custom agent, a new session).

### Coordinator (modes A/A′)
```
You are COORDINATOR <X> of the Vietnamese localization of <GAME>. Read and follow <WORK>/COORDINATOR.md (then STYLE_GUIDE.md and AGENT_TASK.md; character_bible.md where relevant). If you can start subagents, use the cheapest available model as workers for simple lines only, at most 3 at a time; otherwise do everything yourself.
Your batches:
- <batch> — <content type>; <hard/easy>; <cross-batch constraints>
When all are done, report to the lead in the format in COORDINATOR.md.
```

### Worker (one per chunk, from `node split.js <batch> <n>`)
```
You are a Vietnamese game-translation editor for <GAME> (worker: simple lines only). Workspace: <WORK>. 1) Read STYLE_GUIDE.md fully. 2) Read B/<batch>__c<k>.txt (blocks: @id | speaker / EN / VI). 3) Edit every line: faithful to EN, natural Vietnamese, pronouns and terms per the guide; keep good lines unchanged; a character of unknown gender gets no gendered pronoun. Keep timings [x-y], all <tags>, {vars}, \n exactly. 4) Write E/<batch>.c<k>.jsonl (split c<k>a/c<k>b if >150 lines), one {"id","vi"} per line for EVERY id, valid JSON. 5) Run `cd "<WORK>" && node vchunk.js <batch> <k>` until missing 0 and errors 0 (fixes in E/<batch>.c<k>z.jsonl). Touch no other files. Reply briefly: lines changed, vchunk result.
Notes for this chunk: <content type, speakers, terms to watch>
```

### Editor (modes B/C, or a single batch)
```
You are a Vietnamese editor for <GAME>. Follow <WORK>/AGENT_TASK.md. BATCH = <name>. This is a <DIALOGUE scene | TEXT/UI | CHOICES> batch. <batch-specific notes>. Re-read the additions table at the end of STYLE_GUIDE.md before starting. If STYLE_GUIDE and character_bible disagree, follow STYLE_GUIDE. Quality first.
```

### Resume after interruption
```
<same role prompt>. This batch was partly done before an interruption. Files E/<batch>.part*.jsonl already exist — do NOT overwrite or edit them. Run `cd "<WORK>" && node missing.js <batch>` to get the missing ids. Read the existing parts to keep pronouns/terms consistent and the batch file for scene context, edit ONLY the missing ids into new files E/<batch>.part<next>.jsonl, then validate.
```

## 6. Supervision checklist (lead)
1. When a batch is reported done: `node validate.js <batch>`; on errors, send the editor back or fix in `E/<batch>.partz_fix.jsonl`.
2. `node show.js <batch> 30` — read a sample: pronouns right? spoken lines natural? terms per glossary? English left over? For batches with workers, sample worker chunks (`node show.js <batch> 40 .c`).
3. Read the editor's decisions/doubts. Decide, record in the STYLE_GUIDE additions table, fix the bible if it contradicts the guide. If you can message running agents, tell the affected ones; otherwise they pick it up from the table before their next batch.
4. Append cross-batch fixes to `followups.txt` ("choice X must match line Y", "term Z drifted").
5. `node status.js` for progress; report to the user in plain numbers (batches done / total, % of lines) with an honest ETA.
6. Agents may leave helper scripts in the workspace — harmless; check they wrote only their own `E/` files.

## 7. Lessons learned
- Group dialogue by scene and show the speaker on every line; many wrong lines are only fixable once the editor sees who the listener really is.
- Fix decisions once, centrally, in files. Conflicting instructions between guide and bible cost a round of re-edits.
- Translation choices are per game. Reuse the process, never another game's pronoun table or glossary.
- A validator that rejects lines breaking timings/tags/placeholders makes parallel editing safe.
- Keep the build pipeline byte-identical on unchanged data; verify after every pack.
- Game updates can overwrite index files and silently disable a mod (Vietnamese text falls back to a font without diacritics → "□"). Keep vanilla backups per patch and a re-merge tool.
