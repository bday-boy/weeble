import os.path as osp
import re
import time
from typing import Generator

import requests
import requests_cache


by_id_query = '''
query ($id: Int, $page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
        pageInfo {
            currentPage
            lastPage
            hasNextPage
            perPage
        }
        media (id: $id, type: ANIME) {
            id
            title {
                english
            }
            averageScore
            popularity
            staff(sort: [RELEVANCE], page: 1, perPage: 25) {
                edges {
                    node {
                        name {
                            first
                            last
                        }
                    }
                    role
                }
            }
            studios(isMain: true) {
                edges {
                    node {
                        name
                    }
                }
            }
            rankings {
                rank
                type
                year
                season
            }
        }
    }
}
'''

popularity_page_query = '''
query ($pop: Int, $page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
        pageInfo {
            currentPage
            lastPage
            hasNextPage
            perPage
        }
        media (popularity_greater: $pop, type: ANIME) {
            id
            title {
                romaji
                english
                native
            }
            format
            season
            seasonYear
            episodes
            duration
            source(version: 3)
            synonyms
            coverImage {
                extraLarge
                medium
            }
            averageScore
            popularity
            studios(isMain: true) {
                edges {
                    node {
                        name
                    }
                }
            }
        }
    }
}
'''

class AniListAPI:
    def __init__(self):
        self.url_match = re.compile(r'https://anilist\.co.*')
        self.url = 'https://graphql.anilist.co'
        self.page = 1
    
    def post(self, query: str, **variables) -> requests.Response:
        return requests.post(self.url, json={
            'query': query, 'variables': variables
        })
    
    def by_id(self, anime_id: int) -> requests.Response:
        return self.post(query=by_id_query, id=anime_id)
    
    def by_popularity(self, popularity: int) -> Generator[dict, None, None]:
        has_next = True
        while has_next:
            res = self.post(
                popularity_page_query,
                pop=popularity,
                page=self.page,
                perPage=50,
            )
            res_json = res.json().get('data', {}).get('Page', {})
            has_next = res_json.get('pageInfo', {}).get('hasNextPage', False)
            self.page += 1
            time.sleep(1)
            yield res_json.get('media', {})


if __name__ == '__main__':
    from pprint import pprint
    al = AniListAPI()
    count = 0
    res_gen = al.by_popularity(10000)
    for res in res_gen:
        print(al.page)
        count += len(res)
        # print(pprint(next(res_gen)))
    print(count)
