import json
import os.path as osp

from anilistapi import AniListAPI


def anime_is_valid(anime: dict) -> bool:
    # ignore anime with invalid source
    source = anime.get('source')
    if not source:
        return False

    # ignore specials and music vids
    anime_format = anime.get('format')
    if not anime_format or anime_format == 'SPECIAL' \
            or anime_format == 'MUSIC':
        return False

    # ignore anime that have no year or season
    year = anime.get('seasonYear')
    if not year:
        return False

    # ignore really short anime
    episodes = anime.get('episodes') or 0
    duration = anime.get('duration') or 0
    if (duration < 8 and episodes <= 8) or episodes == 0:
        return False

    # ignore anime without a title
    titles = anime.get('title')
    english = titles.get('english')
    romaji = titles.get('romaji')
    native = titles.get('native')
    if not (english or romaji or native or '').strip():
        return False

    # ignore anime without a studio
    if not get_studios(anime):
        return False

    return True


def get_studios(anime: dict) -> str:
    main_studios = []
    studios = anime.get('studios', {}).get('edges', [])
    for studio in studios:
        studio_name = studio.get('node', {}).get('name')
        if studio_name:
            main_studios.append(studio_name)
    return main_studios


def get_title(anime: dict) -> str:
    titles = anime.get('title', {})
    english = titles.get('english')
    romaji = titles.get('romaji')
    native = titles.get('native')
    return (english or romaji or native or '').strip()


def get_synonyms(anime: dict, title: str) -> list:
    titles = anime.get('title', {})
    all_synonyms = {syn.strip() for syn in anime.get('synonyms', []) if syn}
    all_synonyms.update(t[1].strip() for t in titles.items() if t[1])
    all_synonyms.remove(title)
    synonyms = list(all_synonyms)
    return sorted(synonyms, key=lambda s: max(s))


class AnimeJSONifier:
    def __init__(self, data_dir: str, popularity_threshold: int = 10000):
        self.data_dir = data_dir
        self.anilist_api = AniListAPI()
        self.popularity_threshold = popularity_threshold
        self.anime_data = {}
        self.anime_titles = {'titles': {}, 'synonyms': {}}
        self.titles_set = set()

    def save(self, db_file: str = 'anime-database.json',
             titles_file: str = 'anime-titles.json') -> None:
        db_path = osp.normpath(osp.join(self.data_dir, db_file))
        with open(db_path, 'w') as json_out:
            json.dump(self.anime_data, json_out, indent=2, sort_keys=True)

        titles = self.anime_titles['titles']
        synonyms = self.anime_titles['synonyms']
        titles_sorted = {
            'titles': {k: titles[k] for k in sorted(titles)},
            'synonyms': {k: synonyms[k] for k in sorted(synonyms)},
        }
        names_path = osp.normpath(osp.join(self.data_dir, titles_file))
        with open(names_path, 'w') as json_out:
            json.dump(titles_sorted, json_out, indent=2)

    def get_valid_title(self, all_titles: list[str]) -> list[str]:
        for first_valid_title in all_titles:
            if first_valid_title not in self.titles_set:
                self.titles_set.add(first_valid_title)
                return first_valid_title

        return ''

    def get_title_and_synonyms(self, anime: dict) -> tuple[str, list[str]]:
        title = get_title(anime)
        synonyms = get_synonyms(anime, title)
        all_titles = [title] + synonyms

        valid_title = self.get_valid_title(all_titles)

        return valid_title, synonyms

    def add_anime(self, anime: dict) -> None:
        title, synonyms = self.get_title_and_synonyms(anime)
        anime_entry = {}
        anime_entry['id'] = int(anime_id := anime.get('id', 'NO_ID'))
        anime_entry['title'] = title
        anime_entry['studios'] = get_studios(anime)
        anime_entry['popularity'] = anime.get('popularity')
        anime_entry['episodes'] = anime.get('episodes')
        anime_entry['source'] = anime.get('source')
        anime_entry['picture'] = anime.get('coverImage', {}).get('extraLarge')
        anime_entry['synonyms'] = synonyms
        anime_entry['format'] = anime.get('format')
        anime_entry['year'] = anime.get('seasonYear')
        self.anime_data[anime_id] = anime_entry
        self.anime_titles['titles'][title] = anime_id

    def correct_synonyms(self) -> None:
        synonyms_dict = self.anime_titles['synonyms']
        for anime_id, anime in self.anime_data.items():
            synonyms = [syn for syn in anime['synonyms']
                        if syn not in self.titles_set]
            anime['synonyms'] = synonyms
            self.titles_set.update(synonyms)
            for syn in synonyms:
                synonyms_dict[syn] = anime_id

    def populate_anime(self) -> None:
        response_gen = self.anilist_api.by_popularity(
            self.popularity_threshold)

        for res in response_gen:
            for anime in res:
                if anime_is_valid(anime):
                    self.add_anime(anime)

        self.correct_synonyms()


def main():
    data_cleaner = AnimeJSONifier('./static/data', popularity_threshold=10000)
    data_cleaner.populate_anime()
    data_cleaner.save()


if __name__ == '__main__':
    main()
