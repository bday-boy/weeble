# WEEBLE

Uses public APIs to get anime data based on various criteria and then uses that
data to make a Wordle- or Squirle-like game.

## Guessing criteria

- Studio
- Episode count
- Year
- Popularity
- Format
- Source

## TO-DO

### High-priority

- Add give up button and win/lose screen
- Add more filters/customizability
- Make user unable to guess exact ranges of numbers
- Fix guess info badges/tooltips

### Low-priority

- Optimize search suggestions (not needed for now)
- Arrow keys to select dropdown items
- List titles in a logical way (prioritize English)
- Fix on mobile
- Maybe just give user info about the anime at the beginning?

## Bugs

## Uncertainties

- How should the search dropdown be implemented?
  - Automatic display:
    - More intuitive
    - Simpler to use
    - Lacks functionality (nothing shows up when input is blank)
  - Manual display:
    - More work on the user's part
    - More reliable functionality

## Funny stuff

- A bug caused anime aliases to be prioritized over the English titles so
  searching often yielded the French/Italian/Spanish title first, which isn't
  inherently funny or anything but was definitely jarring in a funny way
