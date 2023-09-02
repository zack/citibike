type BonusPointId = number;
type BonusPointPoints = number;
type BonusPointReason = string;
declare type BonusPoint = {
  id: BonusPointsId;
  reason: BonusPointReason;
  points: BonusPointPoints;
  playerId: PlayerId;
}

declare type FactAnswer = boolean;
declare type FactContent = string;
declare type FactId = number;
declare type Fact = {
  answer: FactAnswer;
  content: FactContent;
  id: FactId;
  playerId: PlayerId;
}

declare type GuessGuess = boolean;
declare type GuessId = number;
declare type Guess = {
  factId: FactId,
  guess: GuessGuess,
  id: GuessId,
  playerId: PlayerId,
}

declare type PlayerName = string;
declare type PlayerId = number;
declare type Player = {
  facts?: Fact[];
  id: PlayerId;
  name: PlayerName;
};
