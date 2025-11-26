import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SocketService } from './services/socket.service';
import { GameStateService } from './services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'client';
  private sub: Subscription | null = null;
  visitCount: number = 0;

  constructor(
    private socketService: SocketService,
    private gameState: GameStateService
  ) { }

  ngOnInit() {
    this.sub = this.socketService.onRoleAssigned().subscribe(data => {
      if (data) {
        this.gameState.word = data.word;
        this.gameState.isImpostor = data.isImpostor;
      }
    });

    // Incrementar contador de visitas
    this.socketService.incrementVisitCount().then((count: number) => {
      this.visitCount = count;
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
