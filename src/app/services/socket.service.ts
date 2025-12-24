import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, get } from 'firebase/database';
import { Observable, BehaviorSubject } from 'rxjs';
import { firebaseConfig } from '../firebase-config';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private app: any;
  private db: any;
  private readonly currentPlayerId: string;
  private gameState = inject(GameStateService);

  private playerJoinedSubject = new BehaviorSubject<any[]>([]);
  private gameStartedSubject = new BehaviorSubject<any>(null);
  private turnChangedSubject = new BehaviorSubject<number>(0);
  private gameResetSubject = new BehaviorSubject<any>(null);
  private playerLeftSubject = new BehaviorSubject<any[]>([]);
  private voteResultsSubject = new BehaviorSubject<any>(null);
  private votingStartedSubject = new BehaviorSubject<any>(null);

  private words = [
    "Manzana", "Guitarra", "Playa", "Computadora", "Pizza", "Avión", "Fútbol", "Reloj", "Gato", "Libro",
    "Montaña", "Coche", "Zapato", "Sol", "Luna", "Casa", "Trabajo", "Amigo", "Familia", "Escuela",
    "Agua", "Café", "Pan", "Ciudad", "Río", "Shakira", "Canción", "Batería", "Micrófono", "Concierto",
    "Rock", "Pop", "Reguetón", "Salsa", "Trompeta", "Piano", "Violín", "DJ", "Disco", "Melodía",
    "PlayStation", "Xbox", "Nintendo", "Mario Bros", "Estrategia", "Servidor", "Teléfono", "Tablet",
    "Internet", "Router", "Cable", "Pantalla", "Teclado", "Mouse", "Auriculares", "Red", "Software",
    "Hardware", "BaseDeDatos", "API", "Hamburguesa", "Taco", "Helado", "Chocolate", "Cereal", "Arroz",
    "Pollo", "Sopa", "Ensalada", "Parque de diversiones", "Museo", "Cine", "Teatro", "Hotel",
    "Restaurante", "CentroComercial", "Estadio", "Aeropuerto", "Iglesia", "Perro", "Bicicleta",
    "Camino", "Cielo", "Nube", "Colombia", "Rosa", "Flor", "Llave", "Puerta", "Ventana", "Venezuela"
  ];

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    this.currentPlayerId = Math.random().toString(36).substring(2, 15);
  }

  getSocketId() {
    return this.currentPlayerId;
  }

  resetSubjects() {
    this.playerJoinedSubject.next([]);
    this.gameStartedSubject.next(null);
    this.turnChangedSubject.next(0);
    this.gameResetSubject.next(null);
    this.playerLeftSubject.next([]);
    this.voteResultsSubject.next(null);
    this.votingStartedSubject.next(null);
  }

  createRoom(playerName: string, callback: any) {
    this.resetSubjects();
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = ref(this.db, 'rooms/' + roomId);
    const newPlayer = { id: this.currentPlayerId, name: playerName, isHost: true, score: 0 };

    const roomData = {
      id: roomId,
      players: [newPlayer],
      status: 'lobby',
      word: '',
      impostorId: '',
      turnIndex: 0,
      votes: null,
    };

    set(roomRef, roomData)
      .then(() => {
        this.listenToRoom(roomId);
        callback({ success: true, roomId, room: roomData });
      })
      .catch(err => callback({ success: false, message: err.message }));
  }

  joinRoom(roomId: string, playerName: string, callback: any) {
    this.resetSubjects();
    const roomRef = ref(this.db, 'rooms/' + roomId);

    get(roomRef).then((snapshot) => {
      if (!snapshot.exists()) {
        callback({ success: false, message: 'Sala no encontrada' });
        return;
      }

      const room = snapshot.val();
      if (room.status !== 'lobby') {
        callback({ success: false, message: 'El juego ya ha comenzado' });
        return;
      }

      if (room.players && room.players.some((p: any) => p.name === playerName)) {
        callback({ success: false, message: 'Nombre ya en uso' });
        return;
      }

      const newPlayer = { id: this.currentPlayerId, name: playerName, isHost: false, score: 0 };
      const updatedPlayers = [...(room.players || []), newPlayer];

      update(roomRef, { players: updatedPlayers })
        .then(() => {
          this.listenToRoom(roomId);
          callback({ success: true, room: { ...room, players: updatedPlayers } });
        });

    }).catch((error) => {
      callback({ success: false, message: error.message });
    });
  }

  startGame(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        const playerIds = room.players.map((p: any) => p.id);
        const impostorId = playerIds[Math.floor(Math.random() * playerIds.length)];
        const turnIndex = Math.floor(Math.random() * room.players.length);
        update(roomRef, {
          status: 'playing',
          word: word,
          impostorId: impostorId,
          turnIndex: turnIndex
        });
      }
    });
  }

  endTurn(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        const nextTurn = (room.turnIndex + 1) % room.players.length;
        update(roomRef, { turnIndex: nextTurn });
      }
    });
  }

  resetGame(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    update(roomRef, { status: 'voting' });
  }

  sendVote(player: { id: string, name: string }) {
    const roomId = this.gameState.roomId();
    const voterId = this.currentPlayerId;
    const voteRef = ref(this.db, `rooms/${roomId}/votes/${voterId}`);
    set(voteRef, player.id);
  }

  private listenToRoom(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    let previousStatus = '';

    onValue(roomRef, (snapshot) => {
      const room = snapshot.val();
      if (!room) return;

      if (room.status !== previousStatus) {
        if (room.status === 'playing') {
          const isImpostor = this.currentPlayerId === room.impostorId;
          this.gameStartedSubject.next({
            status: 'playing',
            turnIndex: room.turnIndex,
            impostorId: room.impostorId,
            gameWord: room.word,
            isImpostor: isImpostor,
            word: isImpostor ? 'Eres el impostor' : room.word,
          });
        } else if (room.status === 'voting') {
          this.votingStartedSubject.next(room);
          this.handleVoting(room);
        } else if (room.status === 'lobby') {
          this.gameResetSubject.next(room);
          this.gameStartedSubject.next(null);
        }
        previousStatus = room.status;
      }

      this.playerJoinedSubject.next(room.players || []);
      this.playerLeftSubject.next(room.players || []);

      if (room.turnIndex !== this.turnChangedSubject.value) {
        this.turnChangedSubject.next(room.turnIndex);
      }

      if (room.status === 'voting') {
        this.handleVoting(room);
      }
    });
  }

  private handleVoting(room: any) {
    const votes = room.votes || {};
    const voteCount = Object.keys(votes).length;
    const requiredVotes = room.players.length;

    if (voteCount === requiredVotes) {
      const voteTally: { [playerId: string]: number } = {};
      Object.values(votes).forEach((votedPlayerId: any) => {
        voteTally[votedPlayerId] = (voteTally[votedPlayerId] || 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(voteTally), 0);
      const playersWithMaxVotes = Object.keys(voteTally).filter(playerId => voteTally[playerId] === maxVotes);

      const isTie = playersWithMaxVotes.length > 1;
      const votedOutPlayerId = isTie ? null : playersWithMaxVotes[0];
      const votedOutPlayer = votedOutPlayerId ? room.players.find((p: any) => p.id === votedOutPlayerId) : null;
      const impostorFound = !!votedOutPlayerId && votedOutPlayerId === room.impostorId;

      const votedBreakdown = Object.entries(votes).map(([voterId, votedId]) => {
        const voterName = room.players.find((p: any) => p.id === voterId)?.name || 'Jugador Desconocido';
        const votedName = room.players.find((p: any) => p.id === votedId)?.name || 'Jugador Desconocido';
        return { voter: voterName, voted: votedName };
      });

      const results = {
        voted: votedBreakdown,
        isTie,
        impostorFound,
        votedOutPlayer: votedOutPlayer ? votedOutPlayer.name : null,
      };

      this.voteResultsSubject.next(results);
      this.gameState.setVoteResults(results);
    }
  }

  startNewRound(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    update(roomRef, {
      status: 'lobby',
      word: '',
      impostorId: '',
      turnIndex: 0,
      votes: null,
    });
  }


  onPlayerJoined(): Observable<any> { return this.playerJoinedSubject.asObservable(); }
  onGameStarted(): Observable<any> { return this.gameStartedSubject.asObservable(); }
  onTurnChanged(): Observable<any> { return this.turnChangedSubject.asObservable(); }
  onGameReset(): Observable<any> { return this.gameResetSubject.asObservable(); }
  onPlayerLeft(): Observable<any> { return this.playerLeftSubject.asObservable(); }
  onVoteResults(): Observable<any> { return this.voteResultsSubject.asObservable(); }
  onVotingStarted(): Observable<any> { return this.votingStartedSubject.asObservable(); }
}
