#!/usr/bin/env python
import json
from random import choice

def random_anime():
    with open('./../data/anime-database.json', 'r') as json_in:
        all_anime = json.load(json_in)
    anime_title, anime_info = choice(all_anime.items())
    with open('./../data/anime-daily.json', 'w') as json_out:
        json.dump({anime_title: anime_info}, json_out)


if __name__ == '__main__':
    random_anime()
