#!/usr/bin/env python3
# tools/create_pull_request.py

import argparse
import logging
import sys

from tools import common
from tools.common import github

LOG = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Start all website processes and services"
    )
    parser.add_argument(
        "-t",
        "--title",
        help="Pull request title. Queried for interactively if not given",
    )
    parser.add_argument(
        "-b",
        "--body",
        help="Pull request description. Queried for interactively if not given",
    )
    parser.add_argument(
        "-u",
        "--user",
        help="GitHub username",
    )
    parser.add_argument(
        "-d", "--debug", action="store_true", help="Enable debug output"
    )
    return parser.parse_args()


def configure_logger(debug: bool = False):
    LOG.setLevel(logging.DEBUG if debug else logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    LOG.addHandler(handler)


def get_input(prompt: str, multiline: bool = False) -> str:
    if not multiline:
        return input(prompt)

    print(prompt + "\n")
    contents = []
    while True:
        try:
            contents.append(input())
        except EOFError:
            break
    return "\n".join(contents)


@common.script_wrapper
def main():
    args = parse_args()
    configure_logger(debug=args.debug)

    token = github.get_github_token(interactive=True)
    if args.title is None:
        args.title = get_input("Title: ")
    if args.body is None:
        args.body = get_input("Description (Ctrl+D to return):", multiline=True)

    try:
        github.create_pull_request(token, args.title, args.body, args.user)
    except Exception as ex:
        sys.exit(f"ERROR: Failed to create pull request: {ex}")


if __name__ == "__main__":
    main()
