import json
import os.path as osp

from anilistapi import AniListAPI


def get_studios(anime: dict) -> str:
    main_studios = []
    studios = anime.get('studios', {}).get('edges', [])
    for studio in studios:
        studio_name = studio.get('node', {}).get('name')
        if studio_name:
            main_studios.append(studio_name)
    return main_studios


def validate_anime(anime: dict) -> bool:
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
    season = anime.get('season')
    if year is None or season is None:
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


def get_title(anime: dict) -> str:
    titles = anime.get('title', {})
    english = titles.get('english')
    romaji = titles.get('romaji')
    native = titles.get('native')
    return (english or romaji or native or '').strip()


def get_synonyms(anime: dict, title: str) -> list:
    titles = anime.get('title', {})
    allSynonyms = ({(t[1] or '').strip() for t in titles.items()} - {title}) \
        | {(syn or '').strip() for syn in anime.get('synonyms')}
    synonyms = list(filter(lambda x: bool(x), allSynonyms))
    return sorted(synonyms, key=lambda s: max(list(s)))


class Reformatter:
    def __init__(self, data_dir: str, popularity_threshold: int = 10000):
        self.data_dir = data_dir
        self.anilist_api = AniListAPI()
        self.popularity_threshold = popularity_threshold
        self.data = []
        self.formatted_data = {}
        self.anime_titles = {'titles': {}, 'synonyms': {}}
    
    def save(self, db_file: str = 'anime-database.json',
             titles_file: str = 'anime-titles.json') -> None:
        db_path = osp.normpath(osp.join(self.data_dir, db_file))
        with open(db_path, 'w') as json_out:
            self.data = json.dump(self.formatted_data, json_out, indent=2)
        
        names_path = osp.normpath(osp.join(self.data_dir, titles_file))
        with open(names_path, 'w') as json_out:
            self.data = json.dump(self.anime_titles, json_out, indent=2)
    
    def add_anime(self, anime: dict) -> None:
        anime_entry = {}
        anime_entry['title'] = get_title(anime)
        anime_entry['studios'] = get_studios(anime)
        anime_entry['popularity'] = anime.get('popularity')
        anime_entry['averageScore'] = anime.get('averageScore')
        anime_entry['episodes'] = anime.get('episodes')
        anime_entry['source'] = anime.get('source')
        anime_entry['thumbnail'] = anime.get('coverImage').get('medium')
        anime_entry['picture'] = anime.get('coverImage').get('extraLarge')
        anime_entry['synonyms'] = get_synonyms(anime, anime_entry['title'])
        anime_entry['format'] = anime.get('format')
        anime_entry['season'] = anime.get('season')
        anime_entry['year'] = anime.get('seasonYear')
        self.formatted_data[(animeId := anime.get('id', 'NO_ID'))] = anime_entry
        self.anime_titles['titles'][anime_entry['title']] = animeId
        for synonym in anime_entry['synonyms']:
            self.anime_titles['synonyms'][synonym] = animeId
    
    def generate_json(self) -> None:
        response_gen = self.anilist_api.by_popularity(self.popularity_threshold)
        for res in response_gen:
            for anime in res:
                if validate_anime(anime):
                    self.add_anime(anime)


def main():
    data_cleaner = Reformatter('../../data', popularity_threshold=5000)
    data_cleaner.generate_json()
    data_cleaner.save()


if __name__ == '__main__':
    main()
