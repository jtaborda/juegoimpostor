import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, get, child, push, remove } from 'firebase/database';
import { Observable, BehaviorSubject } from 'rxjs';
import { firebaseConfig } from '../firebase-config';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private app: any;
  private db: any;
  private currentPlayerId: string;

  // Subjects to mimic socket events
  private playerJoinedSubject = new BehaviorSubject<any[]>([]);
  private gameStartedSubject = new BehaviorSubject<any>(null);
  private roleAssignedSubject = new BehaviorSubject<any>(null);
  private turnChangedSubject = new BehaviorSubject<number>(0);
  private gameResetSubject = new BehaviorSubject<any>(null);
  private playerLeftSubject = new BehaviorSubject<any[]>([]);

  // Word List
  private words = [
    // Comunes
    "Manzana", "Guitarra", "Playa", "Computadora", "Pizza",
    "Avión", "Fútbol", "Reloj", "Gato", "Libro",
    "Montaña", "Coche", "Zapato", "Sol", "Luna",
    "Casa", "Trabajo", "Amigo", "Familia", "Escuela",
    "Agua", "Café", "Pan", "Ciudad", "Río", "Shakira",

    // Música
    "Canción", "Batería", "Micrófono", "Concierto",
    "Rock", "Pop", "Reguetón", "Salsa", "Trompeta",
    "Piano", "Violín", "DJ", "Disco", "Melodía",

    // Juegos
    "PlayStation", "Xbox", "Nintendo", "Mario Bros",
    "Estrategia", "Servidor",

    // Tecnología
    "Teléfono", "Tablet", "Internet", "Router", "Cable",
    "Pantalla", "Teclado", "Mouse", "Auriculares", "Red",
    "Software", "Hardware", "Servidor", "BaseDeDatos", "API",

    // Comida
    "Hamburguesa", "Taco", "Helado", "Chocolate", "Cereal",
    "Arroz", "Pollo", "Sopa", "Ensalada",

    // Lugares
    "Parque de diversiones", "Museo", "Cine", "Teatro", "Hotel",
    "Restaurante", "CentroComercial", "Estadio", "Aeropuerto", "Iglesia",

    // Otros variados
    "Perro", "Bicicleta", "Camino", "Cielo", "Nube", "Colombia",
    "Rosa", "Flor", "Llave", "Puerta", "Ventana", "Venezuela"
  ];


  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    // Generate a random ID for this session
    this.currentPlayerId = Math.random().toString(36).substring(2, 15);
  }

  getSocketId() {
    return this.currentPlayerId;
  }

  resetSubjects() {
    this.playerJoinedSubject.next([]);
    this.gameStartedSubject.next(null);
    this.roleAssignedSubject.next(null);
    this.turnChangedSubject.next(0);
    this.gameResetSubject.next(null);
    this.playerLeftSubject.next([]);
  }

  async incrementVisitCount(): Promise<number> {
    const visitsRef = ref(this.db, 'analytics/visits');

    // Verificar si ya visitó en esta sesión del navegador
    const hasVisited = localStorage.getItem('hasVisited');

    try {
      const snapshot = await get(visitsRef);
      const currentCount = snapshot.exists() ? snapshot.val() : 0;

      // Solo incrementar si es una nueva visita
      if (!hasVisited) {
        const newCount = currentCount + 1;
        await set(visitsRef, newCount);
        localStorage.setItem('hasVisited', 'true');
        return newCount;
      }

      return currentCount;
    } catch (error) {
      console.error('Error incrementing visit count:', error);
      return 0;
    }
  }

  // --- Actions ---

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
      turnIndex: 0
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
      if (snapshot.exists()) {
        const room = snapshot.val();
        if (room.status !== 'lobby') {
          callback({ success: false, message: 'El juego ya ha comenzado' });
          return;
        }

        // Check if name exists (simple check)
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

      } else {
        callback({ success: false, message: 'Sala no encontrada' });
      }
    }).catch((error) => {
      callback({ success: false, message: error.message });
    });
  }

  startGame(roomId: string) {
    // Logic moved to client (Host)
    const roomRef = ref(this.db, 'rooms/' + roomId);
    get(roomRef).then(snapshot => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        const playerIds = room.players.map((p: any) => p.id);
        const impostorId = playerIds[Math.floor(Math.random() * playerIds.length)];

        update(roomRef, {
          status: 'playing',
          word: word,
          impostorId: impostorId,
          turnIndex: 0
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
    update(roomRef, {
      status: 'lobby',
      word: '',
      impostorId: '',
      turnIndex: 0
    });
  }

  // --- Listeners ---

  private listenToRoom(roomId: string) {
    const roomRef = ref(this.db, 'rooms/' + roomId);
    onValue(roomRef, (snapshot) => {
      const room = snapshot.val();
      if (!room) return; // Room deleted

      // Player Joined / Left updates
      this.playerJoinedSubject.next(room.players || []);
      this.playerLeftSubject.next(room.players || []);

      // Game Started
      if (room.status === 'playing' && this.gameStartedSubject.value?.status !== 'playing') {
        this.gameStartedSubject.next({
          status: 'playing',
          turnIndex: room.turnIndex,
          totalPlayers: room.players.length,
          impostorId: room.impostorId,
          gameWord: room.word
        });

        // Check Role
        const isImpostor = this.currentPlayerId === room.impostorId;
        this.roleAssignedSubject.next({
          word: isImpostor ? null : room.word,
          isImpostor: isImpostor
        });
      }

      // Turn Changed
      if (room.turnIndex !== this.turnChangedSubject.value) {
        this.turnChangedSubject.next(room.turnIndex);
      }

      // Reset
      if (room.status === 'lobby' && this.gameStartedSubject.value?.status === 'playing') {
        this.gameResetSubject.next(room);
        // Reset local state trackers
        this.gameStartedSubject.next(null);
      }
    });
  }

  // --- Observable Exposure ---

  onPlayerJoined(): Observable<any> { return this.playerJoinedSubject.asObservable(); }
  onGameStarted(): Observable<any> { return this.gameStartedSubject.asObservable(); }
  onRoleAssigned(): Observable<any> { return this.roleAssignedSubject.asObservable(); }
  onTurnChanged(): Observable<any> { return this.turnChangedSubject.asObservable(); }
  onGameReset(): Observable<any> { return this.gameResetSubject.asObservable(); }
  onPlayerLeft(): Observable<any> { return this.playerLeftSubject.asObservable(); }
}
