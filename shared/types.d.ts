declare type FactId = number;
declare type Fact = {
  content: string;
  id: FactId;
  playerId: PlayerId;
  answer: boolean;
}

declare type PlayerName = string;
declare type PlayerId = number;
declare type Player = {
  facts?: Fact[];
  id: PlayerId;
  name: PlayerName;
};

declare type GuessId = number;
declare type Guess = {
  factId: FactId,
  id: GuessId,
  playerId: PlayerId,
  guess: boolean,
}
