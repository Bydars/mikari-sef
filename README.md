# 💠 Misaki — Discord Selfbot

**Misaki** es un selfbot modular, rápido y seguro para Discord, diseñado para uso personal.  
Construido con `discord.js-selfbot-v13@3.7`, Misaki incorpora comandos de voz, sistema de ayuda avanzado, mensajes temporales, presencia personalizada, comandos de sistema, y soporte para mensajes de voz con waveform real generado dinámicamente.

> ⚠️ Este proyecto está destinado exclusivamente a fines educativos y personales. El uso de selfbots **viola los Términos de Servicio de Discord**.

---

## 🚀 Características

- ✅ Sistema modular de comandos (`/commands/[categoría]/comando.js`)
- 🎧 Conexión a canales de voz (`.joinvc`, `.leavevc`)
- 📚 `help` inteligente por categoría, alias, o palabra clave
- 🎤 Comando `.sendaudio` con generación real de forma de onda (waveform)
- 🧠 Carga dinámica de comandos y aliases desde el sistema de archivos
- 🌐 Soporte multiplataforma (Windows y Linux) para FFmpeg
- 🔐 Token aislado en `.env` y configuración separada en `configs/config.json`

---

## 📦 Instalación

```bash
git clone https://github.com/Bydars/mikari-self.git
cd mikari-self
npm install
```

---

## ⚙️ Configuración

### 1. Token

Renombra el archivo `example.env` a `.env`:

```env
DISCORD_TOKEN=Token
```

### 2. Presencia personalizada

Edita `configs/config.json` para configurar tu presencia, actividad, tipo de bot, etc. procura leer para hacer todo como se debe [Setup](configs/README.md)

---

## 🎧 Audio — Requisitos para el comando `.sendaudio`

El comando `.sendaudio` envía un mensaje de voz real con forma de onda calculada automáticamente en base al contenido del `.mp3`.  
Para que funcione, es necesario que el proyecto tenga acceso a FFmpeg.

### 📂 Rutas esperadas:

```
utils/
├─ audios/
│  └─ tu_audio.mp3
└─ libs/
   └─ ffmpeg/
       ├─ win/
       │   └─ bin/
       │       └─ ffmpeg.exe
       └─ linux/
           └─ bin/
               └─ ffmpeg
```

> El selfbot detecta automáticamente el sistema operativo y usa el binario correcto.

---

## 📥 ¿No confías en los binarios incluidos?

Puedes reemplazarlos por versiones oficiales:

### 🔵 Windows

1. Ir a: [https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)
2. Descargar `ffmpeg-release-essentials.zip`
3. Extraer `ffmpeg.exe` y ponerlo en: `utils/libs/ffmpeg/win/bin/`

### 🟢 Linux

1. Ir a: [https://johnvansickle.com/ffmpeg/](https://johnvansickle.com/ffmpeg/)
2. Descargar: `ffmpeg-release-amd64-static.tar.xz`
3. Extraer el binario `ffmpeg`
4. Guardarlo en: `utils/libs/ffmpeg/linux/bin/ffmpeg`
5. Darle permiso de ejecución:

```bash
chmod +x utils/libs/ffmpeg/linux/bin/ffmpeg
```

---

## 🧪 Uso

```bash
npm run start 

npm run dev (solo si estas editando el codigo)
```

El bot se conectará a tu cuenta y mostrará su presencia personalizada.

---

## 🧰 Comandos principales (existen mas, solo ejecuta .help)

| Comando     | Descripción                                          |
|-------------|------------------------------------------------------|
| `.ping`     | Muestra la latencia actual                           |
| `.uptime`   | Tiempo activo desde que se inició el selfbot         |
| `.stats`    | Información de uso, memoria y actividad              |
| `.help`     | Muestra todos los comandos o ayuda por categoría     |
| `.joinvc`   | Se une a un canal de voz por ID                      |
| `.leavevc`  | Desconecta del canal de voz                          |
| `.sendaudio`| Envía un mensaje de voz con waveform real            |

---

## 🔐 Seguridad

- El token nunca se expone públicamente.
- `.env` está en `.gitignore`.
- No compartas tu token ni ejecutes código externo sin revisarlo.

---

## 📜 Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE), aunque su uso público en Discord **no está permitido** según los [Términos de Servicio de Discord](https://discord.com/terms).

---

## 💡 Créditos

Desarrollado por Bydars.  
Basado en `discord.js-selfbot-v13`.
