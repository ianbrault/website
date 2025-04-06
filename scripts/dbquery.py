#!/usr/bin/env python3
# dbquery.py
# Query users in the MongoDB database

import argparse
import pprint
import sys

import pymongo


def parse_args(args: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Queries the server MongoDB database."
    )
    parser.add_argument(
        "collection",
        help="Database collection name."
    )
    parser.add_argument(
        "id",
        nargs="?",
        help="Filter the collection for a specified ID."
    )
    return parser.parse_args(args)


def main(args: argparse.Namespace):
    # connect to the database
    client = pymongo.MongoClient("mongodb://localhost:27017")

    # query all documents in the collection
    collection = client.test[args.collection]
    documents = list(collection.find())

    if args.id:
        # filter documents for the specified ID
        matches = [doc for doc in documents if str(doc["_id"]) == args.id]
        if not matches:
            sys.exit(
                f"ERROR: failed to find ID {args.id} in collection "
                f"'{args.collection}'"
            )
        pprint.pprint(matches[0])
    else:
        pprint.pprint(documents)


if __name__ == "__main__":
    try:
        args = parse_args(sys.argv[1:])
        main(args)
    except KeyboardInterrupt:
        print("Ctrl+C received, terminating...")
        pass
