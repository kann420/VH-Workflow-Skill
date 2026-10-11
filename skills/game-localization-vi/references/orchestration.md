# Orchestration — tiered team, prompts, supervision

## Team shape

```
Lead (you, strongest model)
 ├─ Coordinator A (mid tier)  ── workers (cheapest tier) ×≤3 at a time
 ├─ Coordinator B (mid tier)  ── workers ×≤3
 ├─ ...                         (at most 5 coordinators)
```
- **Lead**: owns research, STYLE_GUIDE, batching, assignment, validation, consistency pass, packing, user communication. Supervises with scripts and short reports; does not re-read whole batches.
- **Coordinator** (e.g. Sonnet): owns a list of batches; edits hard lines itself; splits easy material into chunks for workers; reviews and fixes all worker output; reports decisions that affect other batches.
- **Worker** (e.g. Haiku, Luna, or the harness's smallest model): edits one chunk of simple lines. Simple = short UI labels and menu text, item/outfit/weapon names, combat barks, stat/talent descriptions, test/task strings, short dialogue choices with no relationship pronouns. Workers never get story dialogue whose pronouns depend on who is speaking to whom.

Model names differ per harness. Use the Agent tool's `model` parameter (`"sonnet"`, `"haiku"`, ...) when available; otherwise describe the tier in the prompt. If the user names specific models, use those.

### Assigning batches
Balance coordinators by **difficulty**, not batch count: give each a mix of hard material it edits itself (story scenes, long documents, quest logs) and easy material it hands to workers (menus, item lists, barks, short choices), so no coordinator sits idle while another drowns in hard text.
Give every coordinator per-batch notes: content type, who speaks to whom, and decisions already fixed in other batches that it must match (point to the exact `E/` file). How many coordinators to use (1–5) depends on the amount of remaining work and the user's quota.

### Concurrency and quota
- Harness limits concurrent subagents (20 in Claude Code). Hitting the account usage limit kills every running agent at once; partial files survive. Running fewer agents does not reduce total cost but lowers the loss when a limit hits.
- Cost scales with tokens read: every agent re-reads the guide + bible + its batch. Keep the guide compact, tell agents to read only the bible sections they need, and let cheap models do the bulk easy lines.
- Watch for usage errors in task notifications; stop launching, tell the user, resume after the reset.

## Files handed to agents
Copy `assets/AGENT_TASK.md` and `assets/COORDINATOR.md` into the workspace and replace `<WORK>` with the absolute workspace path. Agents run the core scripts as `cd "<WORK>" && node "<SKILL>/scripts/core/<tool>.js" ...` (or copy the scripts into WORK).

## Prompt templates

### Coordinator
```
You are COORDINATOR <X> of the Vietnamese localization edit of <GAME>. First read and follow <WORK>/COORDINATOR.md (then STYLE_GUIDE.md, AGENT_TASK.md; character_bible.md where relevant). Use worker agents (Agent tool, model "<cheap model>") for simple lines, max 3 at a time.
Your batches:
- <batch> — <content type>; <hard/easy>; <who does it>; <cross-batch constraints>
- ...
When all are done, report to the lead in the format in COORDINATOR.md.
```

### Worker (written by the coordinator, one per chunk)
```
You are a Vietnamese game-translation editor for <GAME>. Workspace: <WORK>. 1) Read STYLE_GUIDE.md fully. 2) Read B/<batch>__c<k>.txt (blocks: @id | speaker / EN / VI). 3) Edit every line: faithful to EN, natural Vietnamese, pronouns and terms per the guide; keep good lines unchanged; if a character's gender is unknown, use no gendered pronoun. Keep timings [x-y], all <tags>, {vars}, \n exactly. 4) Write E/<batch>.c<k>.jsonl (split c<k>a/c<k>b if >150 lines), one {"id","vi"} per line for EVERY id, valid JSON. 5) Run `node <SKILL>/scripts/core/vchunk.js <batch> <k>` until missing 0 and errors 0 (fixes go in E/<batch>.c<k>z.jsonl). Touch no other files. Reply briefly: lines changed, vchunk result.
Notes for this chunk: <content type, speakers, terms to watch>
```

### Single-model batch editor (when not using coordinators)
```
You are a Vietnamese editor for <GAME>. Follow <WORK>/AGENT_TASK.md. BATCH = <name>. This is a <DIALOGUE scene batch | TEXT/UI batch | CHOICES batch>. <batch-specific notes>. If STYLE_GUIDE and character_bible disagree, follow STYLE_GUIDE. Quality first.
```

### Resume after interruption
```
<same role prompt>. This batch was partly done before an interruption. Files E/<batch>.part1.jsonl... already exist — do NOT overwrite or edit them. Run `node <SKILL>/scripts/core/missing.js <batch>` to get the missing ids. Read the existing parts to keep pronouns/terms consistent, read the batch file for scene context, edit ONLY the missing ids into new files E/<batch>.part<next>.jsonl, then validate.
```

## Supervision checklist (lead)
1. On every completion notification: `validate.js <batch>`; if errors, send the agent back (SendMessage) or fix in `E/<batch>.partz_fix.jsonl`.
2. `show.js <batch> 30` — read a sample: pronouns right? spoken lines natural? terms per glossary? untranslated English left? For coordinator batches with workers, sample worker chunks (`show.js <batch> 40 .c`).
3. Read the agent's "decisions / doubts" list. Decide. Record in STYLE_GUIDE "Bổ sung" table; fix the character bible if it contradicts the guide; message running agents affected by the decision.
4. Append cross-batch fixes to `followups.txt` (e.g. "choice X must match lyric in batch Y", "term Z drifted").
5. Track progress with `status.js`; give the user progress in plain numbers (batches done / total, % lines) and an honest ETA.
6. Agents sometimes create helper scripts or extra files in the workspace — harmless; check they did not write outside their batches (`find E -newer <marker>`).

## Lessons learned
- Group dialogue by scene and show the speaker on every line — editors fixed many lines the previous translation got wrong only because the scene showed who the listener really was (e.g. a radio aside to a technician, not to the protagonist).
- Fix decisions once, centrally. Conflicting instructions between the guide and the bible cost a round of re-edits.
- Translation choices are per game. Reuse the process, never another game's pronoun table or glossary.
- A validator that rejects lines breaking timings/tags/placeholders makes it safe to let many agents write in parallel.
- Keep the build pipeline byte-identical on unchanged data; verify after every pack.
- Game updates can overwrite index files and silently disable the mod (Vietnamese text falls back to a font without diacritics → boxes "□"). Keep vanilla backups per patch and a re-merge script.
