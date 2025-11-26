import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { GameStateService } from '../../services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];

  constructor(
    public gameState: GameStateService,
    private socketService: SocketService,
    private router: Router
  ) { }

  ngOnInit() {
    if (!this.gameState.roomId) {
      this.router.navigate(['/']);
      return;
    }

    let gameStarted = false;
    let roleAssigned = false;

    const tryNavigate = () => {
      if (gameStarted && roleAssigned) {
        this.router.navigate(['/game']);
      }
    };

    this.subs.push(
      this.socketService.onPlayerJoined().subscribe(players => {
        this.gameState.players = players;
      }),
      this.socketService.onGameStarted().subscribe(data => {
        if (data) {
          this.gameState.currentTurnIndex = data.turnIndex;
          this.gameState.impostorId = data.impostorId;
          this.gameState.gameWord = data.gameWord;
          gameStarted = true;
          tryNavigate();
        }
      }),
      this.socketService.onRoleAssigned().subscribe(data => {
        if (data) {
          roleAssigned = true;
          tryNavigate();
        }
      }),

      this.socketService.onPlayerLeft().subscribe(players => {
        this.gameState.players = players;
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  startGame() {
    this.socketService.startGame(this.gameState.roomId);
  }

  copyCode() {
    navigator.clipboard.writeText(this.gameState.roomId);
  }
}
