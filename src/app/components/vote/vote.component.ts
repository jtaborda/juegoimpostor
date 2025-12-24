import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoteComponent {
  private gameState = inject(GameStateService);
  private socketService = inject(SocketService);

  public players = this.gameState.players;
  public currentPlayerId = this.socketService.getSocketId();
  public hasVoted = this.gameState.hasVoted;
  public voteResults = this.gameState.vote;
  public showResults = computed(() => !!this.voteResults());
  public gameWord = this.gameState.gameWord;
  public impostorId = this.gameState.impostorId;
  public isHost = this.gameState.isHost;

  public votablePlayers = computed(() => this.players().filter(p => p.id !== this.currentPlayerId));
  public impostorName = computed(() => this.players().find(p => p.id === this.impostorId())?.name);

  voteForPlayer(player: { id: string, name: string }) {
    this.socketService.sendVote(player);
    this.gameState.setHasVoted(true);
  }

  startNewRound() {
    this.socketService.startNewRound(this.gameState.roomId());
  }
}
