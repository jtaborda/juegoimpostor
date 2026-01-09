import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { GameStateService } from '../../services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class HomeComponent implements OnDestroy {
  private socketService = inject(SocketService);
  public gameState = inject(GameStateService);

  public playerName = signal('');
  public roomCode = signal('');
  public isJoining = signal(false);
  public error = signal('');

  private subs: Subscription[] = [];

  constructor() {
    if (!this.gameState.roomId()) {
      this.gameState.reset();
    }
    this.error.set('');

    this.subs.push(
      this.socketService.onPlayerJoined().subscribe(players => {
        this.gameState.setPlayers(players);
      }),

      this.socketService.onGameStarted().subscribe(gameData => {
        if (gameData) {
          this.gameState.setGameData(gameData);
        }
      }),

      this.socketService.onPlayerLeft().subscribe(players => {
        this.gameState.setPlayers(players);
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  public createRoom(): void {
    if (!this.playerName()) return;

    this.socketService.createRoom(this.playerName(), (response: any) => {
      if (response.success) {
        this.gameState.setRoomId(response.roomId);
        this.gameState.setPlayerName(this.playerName());
        this.gameState.setPlayers(response.room.players);
        this.gameState.setHost(true); // Explicitly set host status
      } else {
        this.error.set('Error creating room');
      }
    });
  }

  public joinRoom(): void {
    if (!this.playerName() || !this.roomCode()) return;

    this.socketService.joinRoom(this.roomCode().toUpperCase(), this.playerName(), (response: any) => {
      if (response.success) {
        this.gameState.setRoomId(this.roomCode().toUpperCase());
        this.gameState.setPlayerName(this.playerName());
        this.gameState.setPlayers(response.room.players);
        this.gameState.setHost(false); // Explicitly set host status
      } else {
        this.error.set(response.message);
      }
    });
  }

  public startGame(): void {
    this.socketService.startGame(this.gameState.roomId());
  }

  public copyCode(): void {
    navigator.clipboard.writeText(this.gameState.roomId());
  }

  public updatePlayerName(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.playerName.set(target.value);
  }

  public updateRoomCode(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.roomCode.set(target.value);
  }
}
