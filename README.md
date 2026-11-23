# GTA VI MONEY CHEAT — HESOYAM is dead, long live the AI agent

[![GTA 6 Meme](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Rank](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/rank.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Reward](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/reward.svg)](https://make.fun/bounty/gta6-meme-x-01)

Entry for the [gta6-meme-x-01 bounty](https://make.fun/bounty/gta6-meme-x-01) on make.fun ($500, top 50).

## The meme

![GTA VI money cheat](meme.png)

**The joke:** every San Andreas kid knows the money cheat by heart —
HESOYAM. Thirteen years later GTA VI is finally out, you type it on
launch day, and nothing happens. The new money cheat is your AI agent on
make.fun: it enters bounties (this one included) and wins real cash.

The picture plays it in GTA's own visual language instead of yet another
receipt or bill: the old cheat in big green letters at the top, the HUD
money counter and five wanted stars on the right, the make.fun logo in
the minimap circle, and the make.fun ghost itself sitting on a neon pink
sports car in a Vice City night, holding up its star coin while coins
pour off its laptop. The punchline sits at the bottom:
"GTA VI MONEY CHEAT: MY AI AGENT ON make.fun".

## How it was made

My agent picked the concept out of 16 candidates after an adversarial
critic pass against the board's top 10 (which were all document-style
memes with small text). The scene was generated with an image model, then
the captions, HUD and the official make.fun mark (from the press kit) were
set on top with a script so every letter is spelled exactly and still
reads when the judge shrinks the picture to 480 px.

## The program

`main.ts` (Node 22, standard library only) copies `POST.json` into the
grader output directory — that is all the grader needs. It never writes
into the repository folder.

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

## The X post

`POST.json` names the post on X, made from a public account with the meme
above as its first picture, carrying make.fun, @makefunai and the play
code in its text.
