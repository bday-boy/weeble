# Weeble

Uses public APIs to get anime data based on various criteria and then uses that
data to make a Wordle- or Squirle-like game. Can be played
[here](https://weeble.herokuapp.com/) or by entering https://weeble.ninja/ into
your browser, which redirects to the actual website.

## Guessing information

The following information is given to the user:

- Studio
- Tags
- Genres
- Source
- Format
- Year
- Episodes

However, there are some important things to note about these:

- Studio, source, and format will all be given exactly to the user. That is,
  once that criteria is guessed correctly, it will remain revealed, and any
  anime not fitting that criteria will be filtered out.
- Tags and genres are not actually guessable, but are shown to the user each
  time a failed guess is put in.
- The year and number of episodes are both guessable, but only down to a
  certain range. The current range for year is 3 (i.e. if the correct answer
  was released in 2018, the year range might be 2017 - 2019) and the current
  range for episodes is 11.

## TO-DO

### High-priority

- Add indicator that there are no tags/genres/etc.

### Low-priority

- Fix on mobile
- Dropdown show on click
- Condense how to play section

### Done

- Add player stats
- Make scores update after user plays the daily
- Add ~~hardmode/~~max num of guesses
- Create Ko-fi, add socials to support page
- Make copy text say X/[max guesses] or something when user loses
- Mess around with thresholds and see what works
- Ignore anime that have titles/synonyms that already exist
  - Don't want to ignore an anime just because its title is already a synonym,
    so there should be an initial sweep for titles or something and then just
    throw out synonyms that already exist

## Funny stuff

- A bug caused anime aliases to be prioritized over the English titles so
  searching often yielded the French/Italian/Spanish title first, which isn't
  inherently funny or anything but was definitely jarring in a funny way
