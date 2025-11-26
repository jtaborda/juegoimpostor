# 🎭 Juego del Impostor

![Visitas](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fpoltaborda%2Fjuego-impostor&count_bg=%2300FFCC&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Visitas&edge_flat=false)

Un juego de deducción social multijugador desarrollado con Angular y Firebase Realtime Database.

## 📝 Descripción

**Juego del Impostor** es un juego de deducción social donde los jugadores deben descubrir quién es el impostor entre ellos. Todos los jugadores reciben la misma palabra secreta, excepto uno (el impostor) que no recibe ninguna palabra. Los jugadores se turnan para describir su palabra sin revelarla directamente, mientras el impostor intenta pasar desapercibido.

## ✨ Características

### 🎮 Mecánicas del Juego
- **Salas privadas**: Crea o únete a salas con códigos únicos de 5 caracteres
- **Mínimo 3 jugadores**: Se requieren al menos 3 jugadores para iniciar
- **Asignación aleatoria**: El impostor se elige aleatoriamente al inicio
- **Sistema de turnos**: Los jugadores se turnan para describir su palabra
- **Revelación final**: Al terminar el juego, se revela quién era el impostor y cuál era la palabra

### 🎨 Interfaz de Usuario
- **Diseño moderno**: Interfaz con gradientes vibrantes y efectos glassmorphism
- **Animaciones fluidas**: Transiciones suaves y efectos visuales atractivos
- **Tarjeta reveladora**: Sistema de flip card para revelar tu rol
- **Indicador de turno**: Resalta visualmente de quién es el turno actual
- **Modal de resultados**: Pantalla final con animaciones que revela el impostor

### 🔥 Tecnología
- **Tiempo real**: Sincronización instantánea usando Firebase Realtime Database
- **Sin servidor**: No requiere backend propio, todo funciona con Firebase XD
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

## 🛠️ Tecnologías Utilizadas

- **Angular 18** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Firebase Realtime Database** - Base de datos en tiempo real
- **RxJS** - Programación reactiva con Observables
- **CSS3** - Estilos con animaciones y efectos modernos

## 📦 Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- npm (v9 o superior)
- Cuenta de Firebase

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd client
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   
   Edita el archivo `src/app/firebase-config.ts` con tus credenciales de Firebase:
   ```typescript
   export const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "TU_AUTH_DOMAIN",
     databaseURL: "TU_DATABASE_URL",
     projectId: "TU_PROJECT_ID",
     storageBucket: "TU_STORAGE_BUCKET",
     messagingSenderId: "TU_MESSAGING_SENDER_ID",
     appId: "TU_APP_ID"
   };
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm start
   ```
   
   La aplicación estará disponible en `http://localhost:4200`

5. **Compilar para producción**
   ```bash
   npm run build
   ```

## 🎯 Cómo Jugar

### 1. Crear o Unirse a una Sala
- **Crear sala**: Ingresa tu nombre y haz clic en "Crear Sala". Se generará un código único.
- **Unirse**: Ingresa tu nombre y el código de sala de 5 caracteres.

### 2. Esperar Jugadores
- El host verá el código de la sala que puede compartir con otros jugadores
- Se necesitan mínimo 3 jugadores para comenzar
- Solo el host puede iniciar el juego

### 3. Revelar tu Rol
- Al iniciar, toca la tarjeta para revelar tu rol
- Si eres **jugador normal**: verás la palabra secreta
- Si eres **impostor**: verás "IMPOSTOR" (sin palabra)

### 4. Turnos
- Cada jugador describe su palabra en su turno
- El impostor debe intentar adivinar la palabra y actuar como si la tuviera
- Los jugadores normales deben ser específicos pero no obvios

### 5. Descubrir al Impostor
- Los jugadores discuten y votan quién creen que es el impostor
- El host puede terminar el juego cuando estén listos

### 6. Resultados
- Se muestra quién era el impostor
- Se revela cuál era la palabra secreta
- Puedes volver al inicio para jugar otra partida

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── home/           # Pantalla de inicio
│   │   ├── lobby/          # Sala de espera
│   │   └── game/           # Pantalla de juego
│   ├── services/
│   │   ├── socket.service.ts      # Comunicación con Firebase
│   │   └── game-state.service.ts  # Estado global del juego
│   ├── firebase-config.ts  # Configuración de Firebase
│   ├── app.component.*     # Componente raíz
│   └── app.routes.ts       # Rutas de la aplicación
└── ...
```

## 🔧 Servicios Principales

### SocketService
Maneja toda la comunicación con Firebase Realtime Database:
- `createRoom()`: Crea una nueva sala
- `joinRoom()`: Une a un jugador a una sala existente
- `startGame()`: Inicia el juego y asigna roles
- `endTurn()`: Cambia al siguiente turno
- `resetGame()`: Reinicia el juego al lobby

### GameStateService
Mantiene el estado global del juego:
- Información de la sala (roomId, players)
- Datos del jugador (playerName, isHost)
- Estado del juego (word, isImpostor, currentTurnIndex)

## 📊 Estructura de Datos en Firebase

```javascript
rooms/
  {roomId}/
    id: string              // ID de la sala
    players: [              // Array de jugadores
      {
        id: string,         // ID único del jugador
        name: string,       // Nombre del jugador
        isHost: boolean,    // Si es el host
        score: number       // Puntuación (futuro)
      }
    ]
    status: string          // 'lobby' | 'playing'
    word: string            // Palabra secreta
    impostorId: string      // ID del impostor
    turnIndex: number       // Índice del turno actual
```

## 🎨 Características de Diseño

### Paleta de Colores
- **Primary**: `#00ffcc` (Cyan brillante)
- **Secondary**: `#3333ff` (Azul vibrante)
- **Danger**: `#ff4444` (Rojo para impostor)
- **Background**: Gradientes oscuros con `#1a1a2e` y `#000000`

### Efectos Visuales
- **Glassmorphism**: Fondos semi-transparentes con blur
- **Animaciones**: Flip cards, pulse effects, slide-in modals
- **Gradientes**: Colores vibrantes en botones y títulos
- **Glow effects**: Sombras de neón en elementos importantes

## 🎲 Lista de Palabras

El juego incluye más de 60 palabras en diferentes categorías:
- **Comunes**: Manzana, Guitarra, Playa, etc.
- **Música**: Canción, Batería, Concierto, etc.
- **Juegos**: PlayStation, Xbox, Nintendo, etc.
- **Tecnología**: Teléfono, Internet, Software, etc.
- **Comida**: Hamburguesa, Taco, Helado, etc.
- **Lugares**: Museo, Cine, Teatro, etc.

## 🚀 Características Implementadas

### Sistema de Eventos en Tiempo Real
- ✅ Sincronización automática de jugadores
- ✅ Actualización de turnos en tiempo real
- ✅ Notificación cuando inicia el juego
- ✅ Detección de jugadores que se van

### Gestión de Estado
- ✅ Estado global compartido entre componentes
- ✅ Persistencia durante la navegación
- ✅ Limpieza automática al volver al inicio

### Validaciones
- ✅ Mínimo 3 jugadores para iniciar
- ✅ Nombres únicos en cada sala
- ✅ No se puede unir a juegos en curso
- ✅ Solo el host puede iniciar/terminar el juego

### UX/UI
- ✅ Animaciones fluidas en todas las transiciones
- ✅ Feedback visual en todas las acciones
- ✅ Diseño responsive
- ✅ Efectos hover en elementos interactivos

## 🐛 Solución de Problemas

### El juego no inicia
- Verifica que haya al menos 3 jugadores
- Asegúrate de que solo el host esté iniciando

### No se sincroniza en tiempo real
- Verifica la configuración de Firebase
- Revisa que la URL de la base de datos sea correcta
- Comprueba las reglas de seguridad en Firebase

### Error al crear sala
- Verifica la conexión a internet
- Revisa la consola del navegador para más detalles
- Asegúrate de que Firebase esté configurado correctamente

## 📝 Reglas de Firebase Recomendadas

Para desarrollo:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Para producción (más seguro):
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## 🔮 Futuras Mejoras

- [ ] Sistema de puntuación
- [ ] Votación integrada para descubrir al impostor
- [ ] Chat en tiempo real
- [ ] Más categorías de palabras
- [ ] Configuración de dificultad
- [ ] Historial de partidas
- [ ] Estadísticas de jugadores
- [ ] Modo espectador
- [ ] Sonidos y efectos de audio

## 👨‍💻 Desarrollador

**Pol Taborda**
- Instagram: [@poltaborda](https://instagram.com/poltaborda)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**¡Diviértete jugando y descubriendo al impostor!** 🎭🔍
