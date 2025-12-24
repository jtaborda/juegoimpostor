import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../services/game-state.service';
import { SocketService } from '../../services/socket.service';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class VoteComponent {
  private gameState = inject(GameStateService);
  private socketService = inject(SocketService);
  private readonly currentPlayerId = this.socketService.getSocketId();

  public players = this.gameState.players;
  public hasVoted = this.gameState.hasVoted;
  public voteResults = this.gameState.vote;
  public isImpostor = this.gameState.isImpostor;
  public gameWord = this.gameState.gameWord;
  public isHost = this.gameState.isHost;
  public roomId = this.gameState.roomId;
  public showResults = computed(() => !!this.voteResults()?.voted);

  public impostorName = computed(() => {
    const impostorId = this.gameState.impostorId();
    const players = this.players();
    if (!impostorId || !players) return 'Unknown';
    const impostor = players.find(p => p.id === impostorId);
    return impostor ? impostor.name : 'Unknown';
  });

  public votablePlayers = computed(() => {
    const allPlayers = this.players();
    return allPlayers.filter(p => p.id !== this.currentPlayerId);
  });

  public voteForPlayer(player: Player): void {
    if (!this.hasVoted()) {
      this.socketService.sendVote(player);
      this.gameState.setHasVoted(true);
    }
  }

  public startNewRound(): void {
    this.socketService.startNewRound(this.roomId());
    // Navigation to lobby is handled by AppComponent
  }
}
