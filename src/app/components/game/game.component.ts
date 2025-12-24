import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class GameComponent {
  private socketService = inject(SocketService);
  public gameState = inject(GameStateService);

  public showWord = false;

  public isMyTurn = computed(() => {
    const players = this.gameState.players();
    const turnIndex = this.gameState.currentTurnIndex();
    if (players.length === 0) return false;
    const currentPlayer = players[turnIndex];
    return currentPlayer?.id === this.socketService.getSocketId();
  });

  public currentPlayerName = computed(() => {
    const players = this.gameState.players();
    const turnIndex = this.gameState.currentTurnIndex();
    if (players.length === 0) return 'Unknown';
    const currentPlayer = players[turnIndex];
    return currentPlayer ? currentPlayer.name : 'Unknown';
  });

  constructor() {
    this.socketService.onTurnChanged().subscribe(turnIndex => {
      this.gameState.setCurrentTurnIndex(turnIndex);
    });
  }

  public endTurn(): void {
    if (this.isMyTurn()) {
      this.socketService.endTurn(this.gameState.roomId());
    }
  }

  public resetGame(): void {
    // This will trigger the 'voting' status change
    this.socketService.resetGame(this.gameState.roomId());
  }
}
