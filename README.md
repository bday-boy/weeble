# Weeble

Uses public APIs to get anime data based on various criteria and then uses that
data to make a Wordle- or Squirle-like game.

## Guessing criteria

- Studio
- Format
- Source
- Year
- Episodes

## TO-DO

### High-priority

- Mess around with thresholds and see what works
- Ignore anime that have titles/synonyms that already exist
  - Don't want to ignore an anime just because its title is already a synonym,
    so there should be an initial sweep for titles or something and then just
    throw out synonyms that already exist
- Add player stats
- Add indicator that there are no tags/genres/etc.

### Low-priority

- Optimize search suggestions
- Fix on mobile
- Dropdown show on click
- Add hardmode/max num of guesses
- Create Ko-fi
- Condense how to play section
- Make copy text say X/8 or something when user loses for the day

## Bugs

## Uncertainties

## Funny stuff

- A bug caused anime aliases to be prioritized over the English titles so
  searching often yielded the French/Italian/Spanish title first, which isn't
  inherently funny or anything but was definitely jarring in a funny way
