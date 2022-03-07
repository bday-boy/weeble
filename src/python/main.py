from reformatter import Reformatter


def main():
    data_cleaner = Reformatter('../../data', '../../cache')
    data_cleaner.generate_json()
    data_cleaner.save()


if __name__ == '__main__':
    main()
