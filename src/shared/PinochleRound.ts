export class PinochleRound {
  teamAMeldScore: number;
  teamATrickScore: number;
  teamBMeldScore: number;
  teamBTrickScore: number;
  bid: number;
  teamWithBid: "a" | "b";
  roundComplete: boolean;
  overrideTeamAHasTakenTrick: boolean;
  overrideTeamBHasTakenTrick: boolean;
  uuid: string; // locally unique, not saved when serialized

  constructor(options?: {
    teamAMeldScore?: number;
    teamATrickScore?: number;
    teamBMeldScore?: number;
    teamBTrickScore?: number;
    bid?: number;
    teamWithBid?: "a" | "b";
    roundComplete?: boolean;
    uuid?: string;
  }) {
    const {
      teamAMeldScore = 0,
      teamATrickScore = 0,
      teamBMeldScore = 0,
      teamBTrickScore = 0,
      bid = 25,
      teamWithBid = "a",
      roundComplete = true,
      uuid = crypto.randomUUID(),
    } = options || {};
    // Originally, going set was not calculated if the round was not complete.
    // I changed this to calculate true score always by default.
    this.teamAMeldScore = teamAMeldScore;
    this.teamATrickScore = teamATrickScore;
    this.teamBMeldScore = teamBMeldScore;
    this.teamBTrickScore = teamBTrickScore;
    this.bid = bid;
    this.teamWithBid = teamWithBid;
    this.roundComplete = roundComplete;
    this.overrideTeamAHasTakenTrick = false;
    this.overrideTeamBHasTakenTrick = false;
    this.uuid = uuid;
  }

  // Team must take trick to not go set, but trick doesn't need to have points
  get teamAHasTakenTrick() {
    if (this.overrideTeamAHasTakenTrick) {
      return true;
    }
    return this.teamATrickScore !== 0;
  }

  get teamBHasTakenTrick() {
    if (this.overrideTeamBHasTakenTrick) {
      return true;
    }
    return this.teamBTrickScore !== 0;
  }

  get teamATotalScore() {
    if (this.isTeamASet) {
      return -this.bid;
    }
    return this.teamAMeldScore + this.teamATrickScore;
  }

  get teamBTotalScore() {
    if (this.isTeamBSet) {
      return -this.bid;
    }
    return this.teamBMeldScore + this.teamBTrickScore;
  }

  get isTeamASet() {
    if (this.teamWithBid === "a") {
      if (!this.roundComplete) {
        return false;
      }
      if (!this.teamAHasTakenTrick) {
        return true;
      }
      const score = this.teamAMeldScore + this.teamATrickScore;
      return score < this.bid;
    }
    return false;
  }

  get isTeamBSet() {
    if (this.teamWithBid === "b") {
      if (!this.roundComplete) {
        return false;
      }
      if (!this.teamBHasTakenTrick) {
        return true;
      }
      const score = this.teamBMeldScore + this.teamBTrickScore;
      return score < this.bid;
    }
    return false;
  }

  toJSON() {
    return {
      teamAMeldScore: this.teamAMeldScore,
      teamATrickScore: this.teamATrickScore,
      teamBMeldScore: this.teamBMeldScore,
      teamBTrickScore: this.teamBTrickScore,
      bid: this.bid,
      teamWithBid: this.teamWithBid,
      roundComplete: this.roundComplete,
      overrideTeamAHasTakenTrick: this.overrideTeamAHasTakenTrick,
      overrideTeamBHasTakenTrick: this.overrideTeamBHasTakenTrick,
      uuid: this.uuid,
    };
  }

  static fromObject(obj: any) {
    return new PinochleRound(obj);
  }
}
