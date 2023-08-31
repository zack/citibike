declare type FactId = number;
declare type Fact = {
  id: FactId;
  real: boolean;
  content: string;
  playerId: PlayerId;
}

declare type PlayerName = string;
declare type PlayerId = number;
declare type Player = {
  name: PlayerName;
  id: PlayerId;
  facts?: Fact[];
};
