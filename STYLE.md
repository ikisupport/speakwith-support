# SpeakWith Support Site Style Guide

## Punctuation

### No em dashes

Do not use the em dash (U+2014) anywhere on this site. Em dashes are now strongly associated with AI-generated copy. A site whose pitch is human-centric and words-first undercuts that message when it leans on one of the most recognisable AI punctuation tells.

**Preferred rewrites by role:**

| Role | Use instead | Example |
|---|---|---|
| Parenthetical aside | Commas (light) or parentheses (heavier) | `SpeakWith, built for everyone, works on…` |
| Definition or expansion | Colon | `One promise: your words stay yours.` |
| Hard pause or dramatic break | Period. Start a new sentence. | `It just works. No setup, no accounts.` |
| Inline list intro | Colon or period | |

Read each rewritten sentence aloud. If it sounds worse than the original, prefer the period split over a comma version.

Do not substitute two hyphens (`--`) or a spaced hyphen (` - `). Those are em dashes in a costume and read the same way.

### En dashes

En dashes (U+2013: –) do not currently appear on this site. If a numeric range arises (e.g., pages 10–20), an en dash is correct. Do not use a hyphen for ranges.

### Terminal punctuation

Whether a string ends in a period is decided by **what the string is**, not by
what its key is called. Two questions settle almost every case:

1. **Is it a complete sentence?** Subject and verb, or a full declarative
   clause. If yes, it ends in a period.
2. **Is it a fragment or a label?** A noun phrase, a feature name, a nav item,
   a button, an eyebrow, a bullet point. If yes, no period.

Key names are a hint, not the authority. `pricing.channels.items.*.lead` holds
`App Store` and `Direct (Gumroad)` — those are labels living in a `lead` key,
and they take no period even though every other `lead` on the site does.

**By surface:**

| Surface | Convention |
|---|---|
| Nav labels, CTAs, buttons, eyebrows, badges | No period |
| Table `feature` names and their `subtitle` fragments | No period |
| Bullet `points`, `name`, tags | No period |
| Section `heading` / `title` that is a fragment | No period |
| Section `heading` / `title` that is a complete declarative sentence | Period |
| `lead`, `body`, `intro`, `sub`, `tagline`, `caption`, `note` | Period |
| FAQ `q` and `a` | Period |
| `ariaLabel` written as a sentence | Period |
| `privacy.*` / `terms.*` / `automation.*` section headings | No period (document headers, fragment-style) |

**Imperative headings take no period.** `Get SpeakWith`, `Choose how SpeakWith
works for you`, `Fix lines as they land` are calls to action, not statements.
Without this carve-out the rule would put a period on `Get SpeakWith`.

**Deliberate staccato is allowed and must stay internally consistent.** A
multi-sentence heading keeps its periods (`Your words appear. As you speak.`,
`Your words stay on your Mac. Plain files, no account.`), and so does a set
written as clipped one-word statements — the `home.moat.items.*.label` ledger
(`Local.` / `Markdown.` / `No account.` / `On your computer.`) is a set, not an
inconsistency. Change all four or none.

**`subtitle` takes no period.** The six `pricing.table.rows.*.subtitle` values
render as `<small>` fragments inside a feature cell, which sets the convention
for the role site-wide.

**HTML values are judged on their prose, not their last character.** Several
`automation.sections.*.paragraphs.*.text` values end in `</pre>`, `</table>`,
or `</p>`. Strip the tags before deciding: the sentence inside still needs its
period. A linter that tests the raw last character will flag every one of these
wrongly.

**Empty strings are not violations.** Some `note` keys are intentionally `""`.

---

This guide covers the support website (`support_website/`) only. It does not apply to in-app SpeakWith UI strings, internal documentation, CLAUDE.md, or commit messages.
