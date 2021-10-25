#!/usr/bin/env python3
# nba.py
# contains various scripts for gathering NBA info

import argparse
import asyncio
import json
import logging
import re
import sys
import time

import aiohttp
import bs4

import nba


def parse_args(args):
    parser = argparse.ArgumentParser(description="gathers NBA info")
    parser.add_argument("action", choices=["games", "scores"])
    parser.add_argument("-d", "--debug", action="store_true")
    return parser.parse_args(args)


def parse_games_html(html):
    """
    Description:
        Parses NBA games from queried HTML

    Arguments:
        html - HTML response body

    Returns:
        a list of NBAGame objects
    """
    games = []

    soup = bs4.BeautifulSoup(html, "html.parser")
    # grab the top-level div
    top = soup.body.find("div", id="__next")

    # note: the game divs have the following CSS classes
    classes = "shadow-block bg-white flex md:rounded text-sm relative mb-4"
    games_html = top.find_all("div", class_=classes)
    logging.debug("parsed %d games from the HTML", len(games))

    for game in games_html:
        # teams are wrapped in article tags
        team_divs = game.find_all("article")
        if len(team_divs) != 2:
            logging.error(
                "ERROR: expected to find 2 <article> tags containing team "
                "info but found %d", len(team_divs))
            continue
        # also grab the game URL
        game_url = game.a.get("href")

        away_team_name = team_divs[0].span.string
        home_team_name = team_divs[1].span.string

        away_team = nba.NBATeam(away_team_name)
        home_team = nba.NBATeam(home_team_name)
        games.append(nba.NBAGame(home_team, away_team, game_url))

        # note: log the SVG logo URLs
        away_logo_url = team_divs[0].img.get("src")
        home_logo_url = team_divs[1].img.get("src")
        logging.debug("%s logo: %s", away_team.tricode, away_logo_url)
        logging.debug("%s logo: %s", home_team.tricode, home_logo_url)

    return games


def parse_game_html(game, html):
    """
    Description:
        Parses NBA game information from queried HTML

    Arguments:
        game - NBAGame object, out-parameter that is modified internally
        html - HTML response body
    """
    desc = game.abbreviated_name()

    soup = bs4.BeautifulSoup(html, "html.parser")
    # info is in the final script tag
    script = soup.find_all("script")[-1]
    game_info = json.loads(script.string)["props"]["pageProps"]["game"]

    # grab game time info
    game.period = game_info["period"]
    # TODO: what to do if this fails? i.e. game not yet started
    if match := re.match(r"PT(\d+)M(\d+)\.\d+S", game_info["gameClock"]):
        game.clock = f"{match.group(1)}:{match.group(2)}"
    game.game_time = game_info["gameTimeUTC"]
    logging.debug("%s game time %s", desc, game.game_time)
    logging.debug("%s game clock Q%s %s", desc, game.period, game.clock)

    # grab home team score
    game.home_team_score = game_info["homeTeam"]["score"]
    game.home_team_score_periods = [
        p["score"] for p in game_info["homeTeam"]["periods"]]
    logging.debug(
        "%s %s score %d", desc, game.home_team.tricode, game.home_team_score)

    # grab away team score
    game.away_team_score = game_info["awayTeam"]["score"]
    game.away_team_score_periods = [
        p["score"] for p in game_info["awayTeam"]["periods"]]
    logging.debug(
        "%s %s score %d", desc, game.away_team.tricode, game.away_team_score)


async def get_nba_games():
    """
    Description:
        Grabs a list of NBA games for the current day from NBA.com

    Returns:
        a list of NBAGame objects
    """
    # note: always default to the current day
    date = time.strftime("%Y-%m-%d")
    url = f"https://www.nba.com/games?date={date}"

    # grab games from NBA.com
    # TODO: handle response exceptions
    async with aiohttp.ClientSession() as session:
        logging.info("querying NBA games from %s", url)
        async with session.get(url) as response:
            logging.debug("received response with status %d", response.status)
            html = await response.text()
            # parse games from the returned HTML
            return parse_games_html(html)

    return []


async def get_nba_game_info(game):
    """
    Description:
        Grabs information for the given NBA game from NBA.com

    Arguments:
        game - NBAGame object, out-parameter that is modified internally
    """
    url = f"https://www.nba.com{game.url}"

    # grab game info from NBA.com
    # TODO: handle response exceptions
    async with aiohttp.ClientSession() as session:
        logging.info("querying game from %s", url)
        async with session.get(url) as response:
            logging.debug("received response with status %d", response.status)
            html = await response.text()
            # parse game info from the returned HTML
            parse_game_html(game, html)


async def main(args):
    if args.action == "games":
        # grab all NBA games
        games = await get_nba_games()
        # log all games
        for game in games:
            logging.info("GAME: %s (URL=%s)", game, game.url)
        # also dump games to JSON
        games_json = [g.to_json(short=True) for g in games]
        logging.info("GAMES JSON: %s", json.dumps(games_json))

    elif args.action == "scores":
        # first, grab all NBA games
        games = await get_nba_games()
        # then grab individual game info
        for game in games:
            await get_nba_game_info(game)
        # log all game info
        for game in games:
            logging.info(
                "GAME: %s %d-%d %s",
                game.abbreviated_name(), game.away_team_score,
                game.home_team_score, game.full_clock())
        # also dump game info to JSON
        games_json = [g.to_json() for g in games]
        logging.info("GAMES JSON: %s", json.dumps(games_json))


if __name__ == "__main__":
    try:
        args = parse_args(sys.argv[1:])
        logging.basicConfig(
            format="%(asctime)s %(message)s", datefmt="%H:%M:%S",
            level=logging.DEBUG if args.debug else logging.INFO)

        loop = asyncio.get_event_loop()
        loop.run_until_complete(main(args))
    except KeyboardInterrupt:
        sys.exit(1)
