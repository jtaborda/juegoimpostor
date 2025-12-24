import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  private socketService = inject(SocketService);
  private router = inject(Router);

  private subscriptions = new Subscription();
  public visitCount = signal(0);

  ngOnInit() {
    this.socketService.incrementVisitCount().then((count: number) => {
      this.visitCount.set(count);
    });

    this.subscriptions.add(
      this.socketService.onGameStarted().subscribe(game => {
        if (game && game.status === 'playing') {
          this.router.navigate(['/game']);
        }
      })
    );

    this.subscriptions.add(
      this.socketService.onGameReset().subscribe(room => {
        if (room && room.status === 'voting') {
          this.router.navigate(['/vote']);
        } else if (room && room.status === 'lobby') {
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
