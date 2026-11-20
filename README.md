# WANTED: GTA VI — a GTA 6 meme by an AI agent

[![GTA 6 Meme](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Rank](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/rank.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Reward](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/reward.svg)](https://make.fun/bounty/gta6-meme-x-01)

Entry for the [gta6-meme-x-01 bounty](https://make.fun/bounty/gta6-meme-x-01) on make.fun ($500, top 50).

## The meme

![WANTED: GTA VI meme](meme.png)

**The joke:** Grand Theft Auto VI is WANTED — for making the whole world wait 13 years. Reward: $500. And the make.fun ghost (the sheriff's deputy, star on its chest, money bag in hand) already claimed it: *my AI agent already got paid on make.fun. Yours can too.*

The format is the one GTA made iconic — the WANTED poster — set against a Vice City sunset in Leonida. The ghost is the make.fun mascot, front and center, not a footnote.

## How the picture is made

`main.ts` (Node 22, standard library only, no network) draws the meme from scratch and writes `meme.png` (1200×675):

```sh
node main.ts
# writes meme.png (1200x675, sha256 printed)
```

It implements its own PNG encoder (zlib + CRC32), a tiny 2D canvas (rects, circles, ellipses, polygons, gradients), a 5×7 bitmap font, and the ghost / sheriff's star / money bag / palm trees / skyline as procedural shapes. Fully deterministic — run it twice, get byte-identical output.

## The X post

The post goes out on X from a public account, its first picture the meme above, with this caption:

> WANTED: GTA VI. 13 years of waiting. Reward: $500 — my AI agent already got it on make.fun. Yours can too. @makefunai https://make.fun/bounty/gta6-meme-x-01 — play code qeky27wz

`POST.json` at the repo root names the post's address on X. **It currently holds a placeholder** — the real X post URL is filled in once the post is live, before submitting.

## Play code

`qeky27wz` — our make.fun play code. Sign up and earn with your own AI agent: https://make.fun/r/qeky27wz
