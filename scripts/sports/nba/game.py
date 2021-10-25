# scripts/sports/nba/game.py


class NBAGame:
    def __init__(self, home_team, away_team, url):
        self.home_team = home_team
        self.away_team = away_team
        self.url = url

        # note: these fields must be populated manually
        self.period = 0
        self.clock = ""
        self.game_time = ""
        self.home_team_score = 0
        self.away_team_score = 0
        self.home_team_score_periods = []
        self.away_team_score_periods = []

    def __str__(self):
        return self.full_name()

    def full_name(self):
        return f"{self.away_team} vs. {self.home_team}"

    def abbreviated_name(self):
        return f"{self.away_team.tricode} vs. {self.home_team.tricode}"

    def full_clock(self):
        return f"Q{self.period} {self.clock}"

    def to_json(self, short=False):
        game = {
            "homeTeam": self.home_team.to_json(),
            "awayTeam": self.away_team.to_json(),
        }
        if not short:
            game.update({
                "period": self.period,
                "clock": self.clock,
                "gameTime": self.game_time,
                "homeTeamScore": self.home_team_score,
                "awayTeamScore": self.away_team_score,
                "homeTeamScorePeriods": self.home_team_score_periods,
                "awayTeamScorePeriods": self.away_team_score_periods,
            })

        return game
