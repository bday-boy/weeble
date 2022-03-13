#!/usr/bin/env python
import json
from random import choice

def random_anime():
    with open('./static/data/anime-database.json', 'r') as json_in:
        all_anime = json.load(json_in)
    all_anime = filter(lambda x: x[1].get('popularity') > 25000, all_anime.items())
    anime_title, anime_info = choice(list(all_anime))
    with open('./static/data/anime-daily.json', 'w') as json_out:
        json.dump({anime_title: anime_info}, json_out, indent=2)


if __name__ == '__main__':
    random_anime()
