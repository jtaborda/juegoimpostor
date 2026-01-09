import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class GameComponent implements OnDestroy {
  private socketService = inject(SocketService);
  public gameState = inject(GameStateService);

  private turnSubscription: Subscription;

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
    this.turnSubscription = this.socketService.onTurnChanged().subscribe(turnIndex => {
      this.gameState.setCurrentTurnIndex(turnIndex);
    });
  }

  public endTurn(): void {
    if (this.isMyTurn()) {
      this.socketService.endTurn(this.gameState.roomId());
    }
  }

  public startVoting(): void {
    if (this.gameState.isHost()) {
      this.socketService.startVoting(this.gameState.roomId());
    }
  }

  ngOnDestroy() {
    if (this.turnSubscription) {
      this.turnSubscription.unsubscribe();
    }
  }
}
