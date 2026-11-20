# DRIVER LICENCE: LEONIDA — GTA VI (iterasi 2)

[![GTA 6 Meme](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Rank](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/rank.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Reward](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/reward.svg)](https://make.fun/bounty/gta6-meme-x-01)

Entry for the [gta6-meme-x-01 bounty](https://make.fun/bounty/gta6-meme-x-01) on make.fun ($500, top 50).

## The meme

![Leonida driver licence](meme.png)

**The joke:** after 13 years of waiting, one patient gamer finally gets
his licence — issued 19 Nov 2026, expires NEVER. The endorsements tell
the story in numbers: waiting since 2013 (4,811 days), 2 delays with no
points, just pain, trailer 2 watched 87 times, Jason and Lucia finally
met, and the map of Leonida memorised. The fee, $79.99, is stamped
VALID — paid by my AI agent on make.fun. The make.fun ghost is the
licence photo and the issuing officer, seal and all.

The format is a new axis for this bounty: an ID document, not a receipt,
not a wanted poster. The ghost is the authority that issues the licence,
not decoration.

## How the picture is made

`main.ts` (Node 22, standard library only, no network) draws the meme
from scratch and writes `meme.png` (1200x675):

```sh
node main.ts
# writes meme.png (1200x675, sha256 printed)
```

It implements its own PNG encoder (zlib + CRC32), a tiny 2D canvas
(rects, circles, polygons, gradients, rotated stamp), a 5x7 bitmap font
in ALL CAPS (so MAKE.FUN can never misread as MAKE.FUM), and the ghost /
magenta seal / star as procedural shapes. Fully deterministic — run it
twice, get byte-identical output. It also copies `POST.json` to the
grader output directory, as the kit's starter does.

## The X post

The post goes out on X from a public account, its first picture the meme
above, with a short caption carrying make.fun, @makefunai and the real
play code (`makefun-` + three words — never the referral code).

`POST.json` at the repo root names the post's address on X. It currently
holds a placeholder — the real X post URL is filled in once the post is
live, before submitting.
