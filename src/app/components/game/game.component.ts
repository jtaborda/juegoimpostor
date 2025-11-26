import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { GameStateService } from '../../services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  showWord: boolean = false;
  showResults: boolean = false;

  constructor(
    public gameState: GameStateService,
    private socketService: SocketService,
    private router: Router
  ) { }

  ngOnInit() {
    // Verify we have a room
    if (!this.gameState.roomId) {
      this.router.navigate(['/']);
      return;
    }
    this.subs.push(
      this.socketService.onTurnChanged().subscribe(turnIndex => {
        this.gameState.currentTurnIndex = turnIndex;
      }),
      this.socketService.onGameReset().subscribe((data) => {
        if (data) {
          // Mostrar resultados antes de volver al lobby
          this.showResults = true;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  get isMyTurn(): boolean {
    const currentPlayer = this.gameState.players[this.gameState.currentTurnIndex];
    return currentPlayer && currentPlayer.name === this.gameState.playerName;
  }

  get currentPlayerName(): string {
    const currentPlayer = this.gameState.players[this.gameState.currentTurnIndex];
    return currentPlayer ? currentPlayer.name : 'Unknown';
  }

  get impostorName(): string {
    const impostor = this.gameState.players.find(p => p.id === this.gameState.impostorId);
    return impostor ? impostor.name : 'Unknown';
  }

  endTurn() {
    if (this.isMyTurn) {
      this.socketService.endTurn(this.gameState.roomId);
    }
  }

  resetGame() {
    this.socketService.resetGame(this.gameState.roomId);
  }

  closeResults() {
    this.showResults = false;
    this.gameState.reset();
    this.router.navigate(['/']);
  }
}
