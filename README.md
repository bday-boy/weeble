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
- Store guesses in storage rather than cookies since Safari on iPhone clears
  cookies when closed and the user's daily is deleted
- Add indicator that there are no tags/genres/etc.
- Improve search functionality (make it fuzzier)
- Ignore anime that have titles/synonyms that already exist
  - Don't want to ignore an anime just because its title is already a synonym,
    so there should be an initial sweep for titles or something and then just
    throw out synonyms that already exist

### Low-priority

- Optimize search suggestions
- Fix on mobile
- Dropdown show on click
- Condense how to play section
- Make copy text say X/[max guesses] or something when user loses for the day

### Done

- Add player stats
- Make scores update after user plays the daily
- Add hardmode/max num of guesses
- Create Ko-fi, add socials to support page

## Bugs

- On light mode, X buttons to close popups are hard to see
- Fix Berserk/Berserk title collision (if main title already exists, try to
  use a synonym as the title instead)

## Uncertainties

## Funny stuff

- A bug caused anime aliases to be prioritized over the English titles so
  searching often yielded the French/Italian/Spanish title first, which isn't
  inherently funny or anything but was definitely jarring in a funny way
