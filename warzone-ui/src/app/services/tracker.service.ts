import { ThrowStmt } from "@angular/compiler";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";
import { ScoreboardComponent } from "../pages/scoreboard/scoreboard.component";
import { Config } from "./models/config";
import { TeamScoreboard } from "./models/server-models";

@Injectable({
  providedIn: "root",
})
export class TrackerService {
  private _leaderboard: TeamScoreboard[] = [];
  leaderboard$: BehaviorSubject<TeamScoreboard[]> = new BehaviorSubject([]);

  private _teamScoreboard: TeamScoreboard[];
  teamScoreboard$: BehaviorSubject<TeamScoreboard[]> = new BehaviorSubject([]);

  private _config: Config;
  get config() {
    return this._config;
  }

  private ws: WebSocket;
  constructor() {
    this.ws = new WebSocket(`ws://${environment.api}`);
    this.ws.onmessage = ({ data }) => {
      let msg = JSON.parse(data);
      console.log(msg);
      if (msg.type === "config") {
        this._config = msg.config;
      } else if (msg.type === "leaderboard") {
        console.log(msg);
        this._leaderboard = msg.leaderboard;
        this.leaderboard$.next(msg.leaderboard);
      } else if (msg.type === "teamScoreboards") {
        this._teamScoreboard = msg.scoreboard;
        this.teamScoreboard$.next(msg.scoreboard);
      } else if (msg.type === "teamScoreboardUpdate") {
        this.updateTeamScoreboard(msg.teamscoreboard);
      }
    };
  }

  private updateTeamScoreboard(scorebaord: TeamScoreboard) {
    const index = this._teamScoreboard.findIndex(
      (ts) => ts.captain.teamName === scorebaord.captain.teamName
    );
    this._teamScoreboard[index] = scorebaord;
    this.teamScoreboard$.next(this._teamScoreboard);
  }
}
