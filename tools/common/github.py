# tools/common/github.py

import os
import pathlib
import subprocess

import requests

BASE_BRANCH = "main"
BASE_URL = "https://api.github.com"
REPOSITORY = "website"


def _get_current_branch() -> str:
    return (
        subprocess.check_output(["git", "branch", "--show-current"])
        .decode()
        .strip()
    )


def get_github_token(interactive: bool = False) -> str:
    """
    Retrieves the configured GitHub token. Searches in the following order:
        1) Current working directory
        2) Home directory

    Args:
        interactive: If the token could not be retrieved, query for it
            interactively

    Returns:
        the GitHub token as a str

    Raises:
        RuntimeError: the token file could not be found
    """
    filename = ".gh_token_secret"
    path = None
    search_paths = [
        pathlib.Path.cwd() / filename,
        pathlib.Path.home() / filename,
    ]
    for token_path in search_paths:
        if token_path.exists():
            path = token_path
            break
    if path is None and interactive:
        token = input(f"Enter your GitHub token: ")
        path = pathlib.Path.cwd() / filename
        path.write_text(token + "\n")
    if path is None:
        raise RuntimeError("could not retrieve GitHub token")
    return path.read_text().strip()


def create_pull_request(
    token: str,
    title: str,
    description: str,
    user: str | None = None,
):
    """
    Create a pull request using the GitHub API.

    Args:
        token: GitHub token
        user: Username. Defaults to $USER if not provided
        title: Pull request title
        description: Pull request description
    """
    if user is None:
        user = os.environ["USER"]

    url = f"{BASE_URL}/repos/{user}/{REPOSITORY}/pulls"
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2026-03-10",
    }
    branch = _get_current_branch()
    body = {
        "title": title,
        "body": description,
        "head": f"{user}:{branch}",
        "base": BASE_BRANCH,
    }
    response = requests.post(url, json=body, headers=headers)
    response.raise_for_status()
