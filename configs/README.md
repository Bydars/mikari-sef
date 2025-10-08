# ⚙️ Misaki — Configuración (`config.json`)

Este archivo controla el comportamiento del selfbot Misaki: su prefijo, presencia, actividad, estado de Spotify falso y más.  
Aquí te explicamos **paso a paso cómo configurarlo**, incluso si no sabes nada de programación.

---

## 🧱 Estructura del archivo

```json
{
  "prefix": ".",
  "presence": {
    "enabled": true,
    "mode": "rich",
    "type": "STREAMING",
    "status": "idle",
    "applicationId": "367827983903490050",
    "name": "Wand Services",
    "details": "Wand Services",
    "state": "Chilling",
    "url": "https://www.twitch.tv/misaki",
    "largeImage": "https://i.pinimg.com/736x/f3/0d/86/f30d86c46fc41d8f3b837d2ea067399d.jpg",
    "largeText": "Idle mode",
    "smallImage": "373370493127884800",
    "smallText": "Coded by Bydars",
    "platform": "desktop",
    "custom": {
      "emoji": "🌙",
      "text": "Misaki en chill mode"
    },
    "spotify": {
      "track": "Ponte Loquita",
      "artist": "Katteyes; Kidd Voodoo",
      "album": "Ponte Loquita",
      "duration": 183,
      "songId": "0Lahr7sUDdtYnX3n3KobR6",
      "albumId": "23x1J2mnb1oMcD1ib0gCVx",
      "artistIds": [
        "4kKazhy9tDfOgKSWm5g3F9",
        "10VBp06W8NIgMW4JruLCC4"
      ],
      "largeImage": "spotify:ab67616d00001e029dabed68d8c46d46a0c7890d",
      "smallImage": "spotify:ab67616d0000b2739dabed68d8c46d46a0c7890d"
    }
  }
}
```

---

## 🧭 Guía de configuración

### 1. `prefix`
El carácter que usas para activar comandos. Por defecto: `.`

### 2. `presence.enabled`
Si está en `true`, activa la presencia personalizada. Si lo pones en `false`, el selfbot no mostrará actividad.

### 3. `type`
Puede ser:
- `"PLAYING"`
- `"STREAMING"`
- `"LISTENING"`
- `"WATCHING"`

Usa `"STREAMING"` si quieres poner un link de Twitch.

### 4. `status`
Define el estado: `"online"`, `"idle"`, `"dnd"`, `"invisible"`

### 5. `applicationId`
Puede ser cualquier ID válida o dejarla como está.

---

## 🎨 Personalización visual (imágenes grandes y pequeñas)

- `largeImage`: puede ser una URL directa o formato `spotify:<id>`
- `smallImage`: lo mismo, para ícono pequeño
- `largeText`, `smallText`: textos que aparecen al pasar el mouse

---

## 🌙 Custom status

- `emoji`: emoji que se muestra al lado del estado
- `text`: texto personalizado

---

## 🎧 Spotify falso

Puedes simular que estás escuchando música aunque no sea cierto.

### ¿Cómo obtener los datos?

#### ✅ `track`, `artist`, `album`
- Entra a Spotify web o app.
- Copia el nombre exacto de la canción, artistas y álbum.

#### ✅ `duration`
- Es la duración en segundos.  
  Ejemplo: 3:03 → `183` 

#### ✅ `songId`
- Entra a la canción en Spotify.
- Copia la URL. Ejemplo:

```
https://open.spotify.com/track/0Lahr7sUDdtYnX3n3KobR6
```

- El ID es lo que está después de `/track/` ojo aveces sigue un ?blablabla eso borralo lo unico que necesitamos es lo anterior al ?

#### ✅ `albumId`
- Entra al álbum.
- Copia la URL:

```
https://open.spotify.com/album/23x1J2mnb1oMcD1ib0gCVx
```

- El ID es lo que está después de `/album/` ojo aveces sigue un ?blablabla eso borralo lo unico que necesitamos es lo anterior al ?

#### ✅ `artistIds`
- Entra al perfil de cada artista.
- Copia el ID desde:

```
https://open.spotify.com/artist/10VBp06W8NIgMW4JruLCC4
```

- Puedes agregar varios si la canción tiene colaboración.

---

## 🖼️ ¿Cómo sacar `largeImage` y `smallImage`?

1. Abre Spotify Web.
2. Presiona `Ctrl + Shift + C` para abrir el inspector.
3. Haz clic en la imagen del álbum.
4. Click derecho → Editar como HTML.
5. Busca algo como:

```html
<img src="https://i.scdn.co/image/ab67616d00001e02158b08c02c249bc651b3b47a">
```

6. Copia solo el final:

```
ab67616d00001e02158b08c02c249bc651b3b47a
```

7. Usa:

```
spotify:ab67616d00001e02158b08c02c249bc651b3b47a
```

Haz lo mismo para la imagen pequeña.

---

## ✅ Resultado: presencia personalizada

Tu cuenta se verá como si estuviera reproduciendo una canción real con todos los metadatos.

---

## 🧩 Recomendación

Guarda tus cambios en `config.json`, y luego reinicia Misaki con:

```bash
npm run start 

npm run dev (recomendado si estas haciendo cambios)
```
