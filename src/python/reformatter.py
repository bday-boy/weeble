import json
import re
import os.path as osp

from anilistapi import AniListAPI

ep_director = re.compile(r'episode director.+\(.+\)')

def get_directors(anime: dict) -> str:
    directors = []
    episode_directors = []
    staff = anime.get('staff', {}).get('edges', [])
    for member in staff:
        role = member.get('role').strip().lower()
        if role == 'director' or role == 'chief director':
            full_name = []
            for name in member.get('node', {}).get('name').items():
                _, name = name
                if name:
                    full_name.append(name.strip())
            directors.append(' '.join(full_name))
        elif ep_director.match(role):
            full_name = []
            for name in member.get('node', {}).get('name').items():
                _, name = name
                if name:
                    full_name.append(name.strip())
            episode_directors.append(' '.join(full_name))
    return directors or episode_directors


def get_studios(anime: dict) -> str:
    main_studios = []
    studios = anime.get('studios', {}).get('edges', [])
    for studio in studios:
        studio_name = studio.get('node', {}).get('name')
        if studio_name:
            main_studios.append(studio_name)
    return main_studios


def filter_anime(anime: dict) -> bool:
    if anime.get('id') == 101281:
        a = 1
    # ignore specials and music vids
    anime_format = anime.get('format')
    if not anime_format or anime_format == 'SPECIAL' \
            or anime_format == 'MUSIC':
        return False
    
    # ignore really short anime
    episodes = anime.get('episodes') or 0
    duration = anime.get('duration') or 0
    if duration < 8 and episodes <= 8 or episodes is None:
        return False
    
    # ignore anime without a director or studios
    if not get_directors(anime) or not get_studios(anime):
        return False

    return True


class Reformatter:
    def __init__(self, data_dir: str, cache_dir: str,
                 popularity_threshold: int = 10000):
        self.data_dir = data_dir
        self.anilist_api = AniListAPI(cache_dir)
        self.popularity_threshold = popularity_threshold
        self.data = []
        self.formatted_data = {}
        self.anime_titles = {}
    
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
        titles = anime.get('title', {})
        anime_entry['title'] = titles.get('english') or \
            titles.get('romaji') or titles.get('native')
        if not anime_entry['title']:
            return
        anime_entry['studios'] = get_studios(anime)
        anime_entry['directors'] = get_directors(anime)
        anime_entry['popularity'] = anime.get('popularity')
        anime_entry['averageScore'] = anime.get('averageScore')
        anime_entry['episodes'] = anime.get('episodes')
        anime_entry['source'] = anime.get('source')
        pictures = anime.get('coverImage')
        anime_entry['thumbnail'] = pictures.get('medium')
        anime_entry['picture'] = pictures.get('extraLarge')
        synonyms = ({t[1] for t in titles.items()} - {anime_entry['title']}) \
            | set(anime.get('synonyms'))
        anime_entry['synonyms'] = list(filter(lambda x: bool(x), synonyms))
        anime_entry['format'] = anime.get('format')
        anime_entry['season'] = anime.get('season')
        anime_entry['year'] = anime.get('seasonYear', 0)
        self.formatted_data[anime.get('id', 'NO_ID')] = anime_entry
        for title in ([anime_entry['title']] + anime_entry['synonyms']):
            self.anime_titles[title] = anime.get('id', 'NO_ID')
    
    def generate_json(self) -> None:
        response_gen = self.anilist_api.by_popularity(self.popularity_threshold)
        for res in response_gen:
            filtered_res = list(filter(filter_anime, res))
            for anime in filtered_res:
                self.add_anime(anime)


def main():
    data_cleaner = Reformatter('../../data', '../../cache', popularity_threshold=50000)
    data_cleaner.generate_json()
    data_cleaner.save()


if __name__ == '__main__':
    main()
