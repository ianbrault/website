# scripts/sports/nba/team.py


class NBATeam:
    def __init__(self, team_name):
        self.name = team_name
        self.location = TEAM_LOCATIONS[self.name]
        self.tricode = TEAM_TRICODES[self.name]

    def __str__(self):
        return self.full_name()

    def full_name(self):
        return f"{self.location} {self.name}"

    def to_json(self):
        return {
            "name": self.name,
            "location": self.location,
            "tricode": self.tricode,
        }


TEAM_LOCATIONS = {
    "76ers": "Philadelphia",
    "Bucks": "Milwaukee",
    "Bulls": "Chicago",
    "Cavaliers": "Cleveland",
    "Celtics": "Boston",
    "Clippers": "Los Angeles",
    "Grizzlies": "Memphis",
    "Hawks": "Atlanta",
    "Heat": "Miami",
    "Hornets": "Charlotte",
    "Jazz": "Utah",
    "Kings": "Sacramento",
    "Knicks": "New York",
    "Lakers": "Los Angeles",
    "Magic": "Orlando",
    "Mavericks": "Dallas",
    "Nets": "Brooklyn",
    "Nuggets": "Denver",
    "Pacers": "Indiana",
    "Pelicans": "New Orleans",
    "Pistons": "Detroit",
    "Raptors": "Toronto",
    "Rockets": "Houston",
    "Spurs": "San Antonio",
    "Suns": "Phoenix",
    "Thunder": "Oklahoma City",
    "Timberwolves": "Minnesota",
    "Trail Blazers": "Portland",
    "Warriors": "Golden State",
    "Wizards": "Washington",
}

TEAM_TRICODES = {
    "76ers": "PHI",
    "Bucks": "MIL",
    "Bulls": "CHI",
    "Cavaliers": "CLE",
    "Celtics": "BOS",
    "Clippers": "LAC",
    "Grizzlies": "MEM",
    "Hawks": "ATL",
    "Heat": "MIA",
    "Hornets": "CHA",
    "Jazz": "UTA",
    "Kings": "SAC",
    "Knicks": "NYK",
    "Lakers": "LAL",
    "Magic": "ORL",
    "Mavericks": "DAL",
    "Nets": "BKN",
    "Nuggets": "DEN",
    "Pacers": "IND",
    "Pelicans": "NOP",
    "Pistons": "DET",
    "Raptors": "TOR",
    "Rockets": "HOU",
    "Spurs": "SAS",
    "Suns": "PHX",
    "Thunder": "OKC",
    "Timberwolves": "MIN",
    "Trail Blazers": "POR",
    "Warriors": "GSW",
    "Wizards": "WAS",
}
