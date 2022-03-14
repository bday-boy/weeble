CREATE TABLE DailyAnime (
    id          INTEGER NOT NULL,
    title       TEXT NOT NULL,
    studios     TEXT[] NOT NULL,
    popularity  INTEGER NOT NULL,
    episodes    INTEGER NOT NULL,
    source      TEXT NOT NULL,
    picture     TEXT NOT NULL,
    synonyms    TEXT[] NOT NULL,
    format      TEXT NOT NULL,
    year        INTEGER NOT NULL,
    date        date NOT NULL UNIQUE
);

INSERT INTO DailyAnime VALUES (
    765,
    'Free! -Timeless Medley- The Bond',
    Array['Kyoto Animation'],
    10057,
    1,
    'ORIGINAL',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx98495-4mzOXo8Dj3pY.jpg',
    Array['Free!: Timeless Medley - Kizuna', '\u5287\u5834\u7248 Free!-Timeless Medley- \u7d46'],
    'MOVIE',
    2017,
    '2022-3-13'
) ON CONFLICT (date)
DO UPDATE SET id = EXCLUDED.id, title = EXCLUDED.title,
studios = EXCLUDED.studios, popularity = EXCLUDED.popularity,
episodes = EXCLUDED.episodes, source = EXCLUDED.source,
picture = EXCLUDED.picture, synonyms = EXCLUDED.synonyms,
format = EXCLUDED.format, year = EXCLUDED.year;

SELECT DISTINCT ON ("date") *
FROM DailyAnime
ORDER BY "date" DESC;

SET client_encoding TO 'UTF8';
