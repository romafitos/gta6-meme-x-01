# Mom, it's out (Vice City cut): a GTA VI meme told as one long phone chat

[![GTA 6 Meme](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Rank](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/rank.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Reward](https://make.fun/badge/gta6-meme-x-01/romafitos/gta6-meme-x-01/reward.svg)](https://make.fun/bounty/gta6-meme-x-01)

Entry for the [gta6-meme-x-01 bounty](https://make.fun/bounty/gta6-meme-x-01) on make.fun ($500, top 50).
What gets judged is the X post linked from `POST.json`; `main.ts` only hands that file to the grader.

## The meme

![Vice City Mom chat meme](meme.png)

The whole thirteen-year GTA VI wait, as a chat thread with Mom on a phone that is
somehow still on "LEONIDA 5G" at 12:01 AM on launch night, battery at 3%:

1. **Sep 17, 2013 (GTA V day).** Me at 13: "Mom, can I get GTA 6?" Mom: "When it comes out."
2. **4,811 days later**, past "Fall 2025" and "May 2026", it is Nov 19.
   Me at 26, "sick" and with a sore back: "Mom, it's out." Under the bubble a download
   bar sits at 99% for "GTA VI · Jason & Lucia · 214 GB".
3. **Mom:** "You're 26. Ask your AI agent."
4. **My AI agent:** "Already bought it. Paid Mom's rent too. With real money I won in
   make.fun bounties."

The make.fun ghost (white body, thick black outline, sparkle eyes, magenta star coin)
stands in the bottom corner of the chat holding the GTA VI box, stamped PAID $79.99.

## What changed from the previous round

The previous cut (same chat format) scored well on the ghost and the punchline but was
light on GTA VI itself. This one adds Vice City / Leonida in the header, the 4,811-day
count with both delays named, Jason & Lucia on the download, and spells out that the
money came from make.fun bounties, so the sales pitch is the joke rather than an add-on.

## Running it

```
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

It copies `POST.json` into the output folder and never writes into the repo folder,
so it also works from a read-only checkout.

## License

MIT, see `LICENSE`.
