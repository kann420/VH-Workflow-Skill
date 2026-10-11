# Game formats — extraction, repacking, game updates

## General procedure for any engine
1. **Find the text.** Look at the install folder: big archives (`.pak`, `.rmdblob`, `.bundle`, `.assets`, `.wad`...), index files, a `localization`/`locale`/`text` folder. If a Vietnamese mod exists, diff its files against the vanilla install — the mod's files tell you exactly where the text lives and how it is hooked in. Search GitHub for "<engine/game> unpacker/toc tool" and read the parser source rather than guessing formats.
2. **Write a reader** (Node is a safe default; Python may not be installed — check `python --version` first) that turns every string into a corpus row with `en`, current `vi`, speaker, scene/order.
3. **Write a writer** and prove an **identity round-trip**: rebuilding from the unmodified corpus must reproduce the installed files exactly (or decode to identical content). Do this before any editing.
4. **Install** only into files the mod already replaces; keep the game's own files untouched so updates and integrity are least disturbed.
5. **Fonts**: Vietnamese needs a font with full diacritics. If text shows "□" boxes, the font was reverted or never replaced — check the font redirect first, not the text.

## Corpus schema (what the core scripts expect)
```
id       unique id (e.g. "t:<table key>", "d:<file>:<index>")
kind     "dlg" | "choice" | "text"
en       source text (keep every token exactly)
vi       current Vietnamese ("" when translating fresh)
speaker  speaker label (dialogue)
scene    conversation/cutscene id (dialogue)   order  position within the scene
group    optional grouping for text batches (default: key prefix)
key      original key (string table key)
dupOf    optional: id of the master copy (this row is not batched; finalize copies the master's VI)
```
`link.json` (`{"<copy id>":"<master id>"}`) is an alternative to `dupOf` for copies that live in another file format (e.g. cutscene files without timing marks): `finalize.js` copies the master's VI and strips `[x-y]` timing marks for the copy.

## Validator rules (scripts/validate.js)
- `[start-end]` timing marks: same sequence; if EN starts with one, VI must too.
- Markup tags (br, strong, b, i, u, s, em, p, li, ul, h1–h6, no-wrap, svg-icon, action-key, map-marker, o): same multiset including attributes. Add your engine's tags to the `TAG` regex.
- Placeholders `{NAME}`, `%s`, `%d`, newlines: same multiset.
- Non-empty if EN non-empty.
Stage directions written like tags (`<grunts>`, `<static>`) are NOT in the tag list on purpose — they are translated.

## Document your engine
Keep a short ENGINE.md in the workspace so the next session (or the next game on the same engine) does not reverse-engineer it again: archive/index layout, compression, string encodings (UTF-8/UTF-16), where speakers and scene/sequence ids live, how the mod hooks in (replaced files vs redirected index entries), font files, the commands to extract/pack/verify, and the per-patch backups. Put the engine tools in WORK/engine/.

## When a game update breaks the mod
Symptom: Vietnamese text with "□" boxes (font fallback) or English text back.
1. List files changed by the update (timestamps). Often only index/manifest files are replaced and the mod's own data files survive.
2. Back up the new vanilla index files (e.g. `BACKUP_vanilla_<date>`).
3. Check that none of the files the mod replaces were changed by the patch (compare their entries between old vanilla and new vanilla). If some were (new English lines), re-extract those, add them to the corpus and translate.
4. Re-merge: point the mod's entries into the new index with a merge tool, verify by reading fonts and a few translated lines through the new index, install, compare hashes.
5. The packer must use the newly merged index as its base from then on.
