# Dapur Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/aygal01/dapur-rush/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/aygal01/dapur-rush/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A fast little cooking game set in an Indonesian street-food kitchen
(*dapur* = kitchen). Customers call out orders — Nasi Goreng, Mie Goreng,
Sate Ayam, Bakso — and you run the kitchen alone: grab ingredients from the
crates, chop what needs chopping, mind the pans before they burn, build each
dish on a plate and serve it before the customer's patience runs out.

## How to play

A day lasts 120 seconds. Orders appear on the board at the top with a
patience bar; serve the matching dish before the bar empties to earn its
price plus a speed tip. Expired orders cost you points and a star. The rush
builds as the day goes on: more orders at once, less patience.

1. Take an ingredient from a crate (you carry one thing at a time).
2. Chop chili, vegetables and chicken on the chopping board (hold the
   interact key).
3. Cook on the right station — pans for rice, noodles and eggs, the grill
   for chicken skewers, the pot for meatballs. Done food waits only so long
   before it burns; burnt food goes in the bin.
4. Take a plate at the plating counter and add the dish's cooked and
   chopped parts. When the plate holds exactly a recipe, it becomes that
   dish.
5. Carry the finished plate to the serving counter to serve it.

Recipes:

| Dish | Needs |
| --- | --- |
| Nasi Goreng | fried rice + fried egg + chopped chili |
| Mie Goreng | fried noodles + fried egg + chopped vegetables |
| Sate Ayam | grilled chicken + chopped chili |
| Bakso | boiled meatballs + chopped vegetables |

## Controls

- **WASD / arrow keys** — walk
- **E / Space** — interact with the nearest station (hold to chop)
- **Mouse** — click a station to walk to it and use it; click buttons on the
  start and end screens
- **P** — pause

## Running it

The game is plain static files under `game/` — serve that folder with any
static file server and open `index.html` in a desktop browser. No build
step, no network requests.

For judging screenshots the game accepts deterministic staged scenes:
`index.html?shot=start`, `?shot=play`, `?shot=end`, each with `&seed=N`.

## Handing it in

`main.ts` (Node 22+, standard library only) copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` with the
vendored library in `vendor/makefun-game.ts`:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

MIT licensed — see `LICENSE`.
