import { PinochleRound } from "./PinochleRound.ts";

// @ts-expect-error project does not include types
import { generate } from "project-namer";

export class PinochleGame {
  rounds: PinochleRound[];
  currentRoundIndex: number;
  teamAName: string;
  teamBName: string;
  gameName: string;
  uuid: string;

  constructor(options?: {
    teamAName?: string;
    teamBName?: string;
    gameName?: string;
    uuid?: string;
  }) {
    const {
      teamAName = "Awesome Team A",
      teamBName = "Fabulous Team B",
      gameName = generate().dashed.toLowerCase(),
      uuid = crypto.randomUUID(),
    } = options || {};
    this.teamAName = teamAName;
    this.teamBName = teamBName;
    this.rounds = [];
    this.currentRoundIndex = 0;
    this.rounds.push(new PinochleRound());
    this.gameName = gameName;
    this.uuid = uuid;
  }

  newRound() {
    this.rounds.push(new PinochleRound());
    this.currentRoundIndex++;
  }

  getTeamAScore(upToRound: number) {
    return this.rounds
      .filter((_, index) => index <= upToRound)
      .reduce((acc, round) => acc + round.teamATotalScore, 0);
  }

  getTeamBScore(upToRound: number) {
    return this.rounds
      .filter((_, index) => index <= upToRound)
      .reduce((acc, round) => acc + round.teamBTotalScore, 0);
  }

  toJSON(): any {
    return {
      rounds: this.rounds,
      currentRoundIndex: this.currentRoundIndex,
      teamAName: this.teamAName,
      teamBName: this.teamBName,
      gameName: this.gameName,
    };
  }

  static fromJSON(json: any) {
    const obj =
      typeof json === "string" || json instanceof String
        ? JSON.parse(json as string)
        : json;
    const game = new PinochleGame();
    game.rounds = obj.rounds.map((round: any) => new PinochleRound(round));
    game.currentRoundIndex = obj.currentRoundIndex;
    game.teamAName = obj.teamAName;
    game.teamBName = obj.teamBName;
    game.gameName = obj.gameName;
    game.uuid = obj.uuid;
    return game;
  }
}
