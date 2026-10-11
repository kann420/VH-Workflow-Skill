# game-localization-vi

**A Claude Code skill for translating video games into Vietnamese — or re-editing an existing Vietnamese translation — with a research-first, tiered-agent workflow.**
**Skill Claude Code để Việt hóa game hoặc biên tập lại bản Việt hóa có sẵn, theo quy trình research trước, đội agent nhiều tầng.**

[English](#english) · [Tiếng Việt](#tiếng-việt)

![Workflow](docs/workflow.png)

<sub>Diagram source: [`docs/workflow.html`](docs/workflow.html) (plain HTML/CSS — open it in a browser).</sub>

---

## English

### What it is
`game-localization-vi` is a **process**, not a phrasebook. It tells an AI agent *how* to run a game translation project end to end; it never decides *how a particular game should be translated*. Pronoun pairs, which names stay in the source language, the tone of documents, how a monster or an AI speaks — all of that comes from researching each game and is written into that game's own style guide.

Why: Vietnamese pronouns (xưng hô) encode age, gender, kinship, rank and attitude, and Vietnamese separates spoken and written register sharply. Translations fail when the editor does not know who is speaking to whom, or what kind of text a line is. The workflow fixes exactly that.

### Workflow
1. **Extract** every string into `corpus.jsonl` (source, current translation, speaker, scene order) and prove the game files can be rebuilt byte-identically.
2. **Research the story first** — bot-friendly sources (wikis, Wikipedia, official blogs, walkthrough sites, reviews) plus mining the game's own text → a **character bible** (gender, age, relationships, register, recommended pronoun pairs).
3. **Write a style guide for this game** from a template: pronoun table, spoken vs written register, glossary, examples. Characters of **unknown gender get no gendered pronoun**.
4. **Batch** the text (~15k source characters per batch); dialogue is grouped **by scene** so editors see who talks to whom.
5. **Tiered editing team**: the lead (strongest model) supervises up to **5 coordinators** (mid-tier models); each coordinator edits the hard lines itself and hands **only simple lines** (UI, item names, barks, short choices) to up to 3 **workers** (cheapest model — Haiku, Luna, …), then reviews every worker line.
6. **Validate & supervise** — subtitle timings, markup tags and placeholders must survive; decisions are fixed centrally and pushed to running agents.
7. **Consistency pass** — merge edits, propagate duplicate lines, unify drifted terms with source-aware rules.
8. **Rebuild, verify, install** — every entry checked, backups kept, game closed.

### Install

**Option A — Claude Code plugin marketplace (recommended)**
Inside Claude Code:
```text
/plugin marketplace add kann420/VH-Workflow-Skill
/plugin install game-localization-vi@viet-hoa-skills
```
From a terminal:
```bash
claude plugin marketplace add kann420/VH-Workflow-Skill
claude plugin install game-localization-vi@viet-hoa-skills --scope user
```

**Option B — npx (third-party tools, not by Anthropic)**
```bash
# Vercel Labs "skills" CLI
npx skills add kann420/VH-Workflow-Skill -a claude-code -g
```
```bash
# degit: copy just the skill folder into your personal skills directory
npx degit kann420/VH-Workflow-Skill/skills/game-localization-vi ~/.claude/skills/game-localization-vi
```

**Option C — manual copy**
Copy `skills/game-localization-vi/` to:
- personal (all projects): `~/.claude/skills/game-localization-vi/` — Windows: `%USERPROFILE%\.claude\skills\game-localization-vi\`
- one project only: `<project>/.claude/skills/game-localization-vi/`

Restart Claude Code (or start a new session) after installing.

### Requirements
- Claude Code (or another agent harness that supports Agent Skills and subagents).
- **Node.js 18+** for the bundled scripts.
- Your own engine-specific extract/repack tools for the game (the skill explains what they must do and how to verify them).

### Usage
Just describe the job, for example:
- "Việt hóa game *X*, text nằm trong `C:\Games\X\localization`"
- "The Vietnamese mod for *Y* has wrong pronouns and Google-Translate sentences, fix it"
- "Continue the localization batches from yesterday"

### Repository layout
```
.claude-plugin/          plugin + marketplace manifests
docs/                    workflow diagram (HTML + PNG)
skills/game-localization-vi/
  SKILL.md               the workflow
  references/            research.md · orchestration.md · game-formats.md
  assets/                STYLE_GUIDE_template.md · AGENT_TASK.md · COORDINATOR.md · postfix.rules.template.js
  scripts/               build_batches · validate · split · vchunk · missing · show · status · finalize · postfix (Node.js)
```

### License
MIT — see [LICENSE](LICENSE). © 2026 VH Workflow Skills.

### Origin
Built while re-editing a 43,000-line Vietnamese fan translation of a story-heavy action game: the old translation had been machine-translated and patched with regexes, with wrong pronouns everywhere. The game-specific parts of that project are intentionally **not** included — only the reusable process.

---

## Tiếng Việt

### Đây là gì
`game-localization-vi` là một **quy trình**, không phải bộ từ điển. Skill chỉ cho AI biết *cách* chạy một dự án Việt hóa từ đầu đến cuối; nó **không** quyết định *một game cụ thể phải dịch thế nào*. Cặp xưng hô, tên nào giữ tiếng gốc, giọng văn tài liệu, cách quái vật hay AI nói chuyện… đều lấy từ research của từng game và ghi vào cẩm nang riêng của game đó.

Lý do: xưng hô tiếng Việt mang theo tuổi tác, giới tính, quan hệ gia đình, cấp bậc và thái độ; tiếng Việt cũng phân biệt rõ văn nói và văn viết. Bản dịch hỏng khi người dịch không biết ai đang nói với ai, hay câu đó là loại văn bản gì. Quy trình này giải quyết đúng chỗ đó.

### Quy trình
1. **Trích xuất** toàn bộ text vào `corpus.jsonl` (câu gốc, bản dịch hiện tại, người nói, thứ tự trong cảnh) và chứng minh dựng lại file game giống hệt từng byte.
2. **Research cốt truyện trước tiên** — nguồn uy tín, không chặn bot (wiki, Wikipedia, blog nhà phát triển, trang hướng dẫn, review) + đọc chính text trong game → **hồ sơ nhân vật** (giới tính, tuổi, quan hệ, giọng nói, cặp xưng hô đề xuất).
3. **Viết cẩm nang riêng cho game** từ mẫu: bảng xưng hô, văn nói và văn viết, thuật ngữ, ví dụ. Nhân vật **không rõ giới tính thì không dùng đại từ nhân xưng có giới tính**.
4. **Chia lô** (~15 nghìn ký tự gốc mỗi lô); thoại được xếp **theo cảnh** để người sửa thấy ai nói với ai.
5. **Đội biên tập nhiều tầng**: trưởng dự án (model mạnh nhất) điều phối tối đa **5 trưởng nhóm** (model tầng giữa). Mỗi trưởng nhóm tự sửa câu khó, giao **chỉ câu đơn giản** (UI, tên vật phẩm, câu chiến đấu, lựa chọn ngắn) cho tối đa 3 **trợ lý** (model rẻ nhất — Haiku, Luna…), rồi duyệt lại toàn bộ bài của trợ lý.
6. **Kiểm tra & giám sát** — mốc thời gian phụ đề, thẻ định dạng, biến phải còn nguyên; quyết định được chốt tập trung và gửi tới các agent đang chạy.
7. **Rà soát thống nhất** — gộp bản sửa, đồng bộ câu trùng, thống nhất thuật ngữ bị lệch bằng luật có điều kiện theo câu gốc.
8. **Đóng gói, kiểm tra, cài đặt** — kiểm từng dòng, giữ bản sao lưu, cài khi đã thoát game.

### Cài đặt

**Cách A — Plugin marketplace của Claude Code (khuyên dùng)**
Trong Claude Code:
```text
/plugin marketplace add kann420/VH-Workflow-Skill
/plugin install game-localization-vi@viet-hoa-skills
```
Trong terminal:
```bash
claude plugin marketplace add kann420/VH-Workflow-Skill
claude plugin install game-localization-vi@viet-hoa-skills --scope user
```

**Cách B — npx (công cụ bên thứ ba, không phải của Anthropic)**
```bash
# CLI "skills" của Vercel Labs
npx skills add kann420/VH-Workflow-Skill -a claude-code -g
```
```bash
# degit: chỉ chép thư mục skill vào thư mục skill cá nhân
npx degit kann420/VH-Workflow-Skill/skills/game-localization-vi ~/.claude/skills/game-localization-vi
```

**Cách C — chép tay**
Chép thư mục `skills/game-localization-vi/` vào:
- dùng cho mọi dự án: `~/.claude/skills/game-localization-vi/` — Windows: `%USERPROFILE%\.claude\skills\game-localization-vi\`
- chỉ một dự án: `<dự án>/.claude/skills/game-localization-vi/`

Cài xong thì khởi động lại Claude Code (hoặc mở phiên mới).

### Yêu cầu
- Claude Code (hoặc harness khác hỗ trợ Agent Skills và subagent).
- **Node.js 18+** để chạy các script kèm theo.
- Công cụ trích xuất/đóng gói riêng cho engine của game (skill hướng dẫn công cụ đó cần làm gì và kiểm tra ra sao).

### Cách dùng
Chỉ cần mô tả việc cần làm, ví dụ:
- "Việt hóa game *X*, text nằm trong `C:\Games\X\localization`"
- "Bản Việt hóa *Y* sai xưng hô, câu như Google Dịch, sửa giúp tôi"
- "Dịch tiếp các lô hôm qua"

### Cấu trúc repo
```
.claude-plugin/          khai báo plugin + marketplace
docs/                    sơ đồ quy trình (HTML + PNG)
skills/game-localization-vi/
  SKILL.md               quy trình
  references/            research.md · orchestration.md · game-formats.md
  assets/                STYLE_GUIDE_template.md · AGENT_TASK.md · COORDINATOR.md · postfix.rules.template.js
  scripts/               build_batches · validate · split · vchunk · missing · show · status · finalize · postfix (Node.js)
```

### Giấy phép
MIT — xem [LICENSE](LICENSE). © 2026 VH Workflow Skills.

### Nguồn gốc
Skill được đúc kết khi biên tập lại một bản Việt hóa 43.000 dòng của một game hành động nặng cốt truyện. Bản cũ dịch máy rồi vá bằng regex, sai xưng hô khắp nơi. Các phần riêng của game đó cố ý **không** đưa vào đây; chỉ giữ lại quy trình dùng lại được.
