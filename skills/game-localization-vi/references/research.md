# Story research — sources, targets, prompts

Research happens **before** any editing. Its only purpose is to make translation decisions correct: who is older, who is whose sibling or boss, who is hostile, who is a child, how an entity speaks, what each in-game term means.

## 1. Sources (reliable *and* bot-friendly)

Prefer sources that serve plain HTML to crawlers. In practice:

| Usually works with WebFetch | Notes |
|---|---|
| Fandom wikis (`<game>.fandom.com/wiki/...`) | Character pages, story summaries, glossary. Best single source; check page history dates for a new game. |
| Wikipedia (`en.wikipedia.org`) | Premise, plot summary, release info. Reliable but brief. |
| Official developer/publisher blogs and press kits | Names, roles, premise; no spoilers usually. |
| Walkthrough/guide sites: PowerPyx, KeenGamer, GameRant, TheGamer, IGN wiki guides, AllThings.how, Whisper-of-the-House-style fan sites | Mission-by-mission detail, side-quest characters. Cross-check genders/names between two guides — they make mistakes. |
| PlayStation Blog / Xbox Wire, GamingBolt, Shacknews, review sites | Character intros, tone, ending explanations. |
| Studio wikis of earlier games in the series | Backstory, recurring characters. |

Usually **blocked or useless for bots** (don't waste calls): Reddit, Steam store/community pages, Forbes, ResetEra, many paywalled outlets, YouTube (no transcripts without an API), Discord. If WebSearch results only point to these, use WebSearch `mode: "extended"` or search for the same info on a wiki/guide.

When no script or transcript is public (new games), say so in the report and lean on the game text itself (section 3).

## 2. What to extract

1. Premise, full plot summary by act, endings; backstory from earlier games that the dialogue references.
2. **Character table** — for every named character: gender, age band (child / young adult / middle-aged / elderly) with evidence, role/rank/organization, relationship and attitude to the protagonist (and to the other main characters), speech register (formal, military, profane, scientific, childlike, archaic, entity-like), human/entity/AI. Mark confirmed vs uncertain.
3. Relationship facts that drive pronouns: siblings and who is older, parent/child, boss/subordinate, mentor, enemies, love interests, children, very old people, non-human speakers (and how they refer to themselves — plural? third person?).
4. Glossary of proper nouns and game terms with one-line meanings (factions, places, abilities, enemies, items, systems).
5. Tone/genre notes (horror, comedy, bureaucratic, mystical...), document types present (memos, letters, audio logs, radio).
6. Source URLs.

## 3. Mine the game text (character bible)

The corpus is the most authoritative source. A second subagent should search it (node scripts or Grep over `corpus.jsonl`) for:
- pronouns used *about* each speaker ("he/she/her/his"), titles ("Mr.", "Ms.", "ma'am", "sir", "Dr."), kinship ("my sister", "baby brother", "twins"), ages ("age 10", "my children will be adults now"),
- how each character addresses the protagonist (name, surname, nickname, insult),
- who talks to whom (use scene grouping),
- register samples.

It then recommends Vietnamese pronoun pairs per relationship with a one-line reason, flags conflicts with the web research, and lists **unknown-gender** characters explicitly (editors will avoid gendered pronouns for them).

## 4. Prompt templates

### Web research subagent (general-purpose, background)
```
Research the video game "<GAME>" (<developer>, <year>; protagonist <name>; setting ...). The goal is a Vietnamese translation edit: we must choose correct Vietnamese pronouns (xưng hô) between characters, so relationships, ages, genders, hierarchy and tone matter most.
Use WebSearch (standard; extended if thin) and WebFetch on bot-friendly sources: Fandom wiki, Wikipedia, official blogs, walkthrough sites (PowerPyx, KeenGamer...), press reviews. Skip Reddit/Steam/Forbes (they block bots).
Save a markdown report to <WORK>/research_story.md with: 1) premise + plot summary by act + endings + needed backstory; 2) CHARACTER TABLE (gender, age band, role, relation & attitude to protagonist, register, nature; confirmed/uncertain); 3) relationship notes that drive pronouns; 4) glossary of terms; 5) tone notes; 6) sources. Don't invent; say what you could not find. Reply with a ≤300-word summary of the key relationship facts.
```

### Game-text bible subagent
```
From <WORK>/corpus.jsonl (fields id, kind, key, speaker, scene, order, en, vi), build a CHARACTER BIBLE for Vietnamese xưng hô. For every speaker with ≥8 lines plus key low-line characters: gender (evidence: pronouns/titles used about them, cite ids), role/rank, age band, relation & attitude to the protagonist, how they address him/her, who they talk to, register, and RECOMMENDED Vietnamese pronouns both ways with a reason. Defaults: adult colleagues tôi–anh / tôi–cô; avoid "bạn" between characters. List unknown-gender characters explicitly. End with "Ambiguities". Known facts: <paste key facts from research>. Use node or Grep; don't modify the corpus. Save to <WORK>/character_bible.md; reply with a ≤200-word summary.
```
