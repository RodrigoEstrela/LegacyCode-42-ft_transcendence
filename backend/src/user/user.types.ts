export  type UserStats = {
  "Games Played": number;
  "Wins": number;
  "Losses": number;
  "Score": number;
  "Rank": string;
  "Achievements": string;
};

type GameHistory = {
  "Opponent": string;
  "Score": string;
  "Result": string;
  "Type": string;
}

export type UserHistory = GameHistory[];