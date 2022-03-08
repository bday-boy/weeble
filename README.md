# weeble

Uses public APIs to get anime data based on various criteria and then uses that
data to make a Wordle- or Squirle-like game.

## Guessing criteria

- Studio
- Director
- Episode count
- Year
- Popularity
- Format
- Source

## TO-DO

- Optimize search suggestions (not needed for now)
- Paginate staff calls for shows without director/episode director
- Use string similarity to find anime the user meant to type
- Single up arrow for within 10 years, double for outside
- Single up arrow for within 20 episodes, double for outside
- Include guess information in mouse over
- Filters in search bar
- Arrow keys to select dropdown items
- Add source and format to info
- List titles in order of shortest to longest
- Fix on mobile
- Add spacing around guess status nodes
- Interface that tracks correct info/ranges guessed by user

## Funny stuff

- A bug caused anime aliases to be prioritized over the English titles so
  searching often yielded the French/Italian/Spanish title first, which isn't
  inherently funny or anything but was definitely jarring in a funny way
