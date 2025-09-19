require("dotenv").config();
const { Client } = require("discord.js-selfbot-v13");
const fs = require("fs");
const path = require("path");

const logger = require("./utils/logger");
const { buildTree } = require("./utils/tree");
const { setupPresence } = require("./utils/presence");
const config = require("./configs/config.json");

const PREFIX = config.prefix || ".";

if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN.length < 20) {
  logger.error("❌ FALTA DISCORD_TOKEN en .env");
  process.exit(1);
}

const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) {
  logger.error("❌ Carpeta 'commands/' no encontrada");
  process.exit(1);
}

const client = new Client({ checkUpdate: false });

client.commands = new Map();
client.aliases = new Map();
client.categories = new Set();
client.stats = {
  commandsUsed: 0,
  startedAt: Date.now(),
};

function autoload() {
  const start = Date.now();

  client.commands.clear();
  client.aliases.clear();
  client.categories.clear();

  const cats = fs
    .readdirSync(commandsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const cat of cats) {
    client.categories.add(cat);

    const files = fs
      .readdirSync(path.join(commandsPath, cat))
      .filter((f) => f.endsWith(".js"));

    for (const f of files) {
      const full = path.join(commandsPath, cat, f);

      try {
        delete require.cache[require.resolve(full)];
        const cmd = require(full);

        if (!cmd?.name || typeof cmd.run !== "function") {
          logger.warn(`⚠️ Ignorando '${f}' en [${cat}] (falta name/run)`);
          continue;
        }

        if (client.commands.has(cmd.name)) {
          logger.warn(`⚠️ Comando duplicado '${cmd.name}' en [${cat}]`);
          continue;
        }

        cmd.category = cat;
        cmd.aliases = Array.isArray(cmd.aliases) ? cmd.aliases : [];
        cmd.ownerOnly = cmd.ownerOnly ?? false;
        cmd.guildOnly = cmd.guildOnly ?? false;

        client.commands.set(cmd.name, cmd);

        for (const alias of cmd.aliases) {
          if (client.aliases.has(alias)) {
            logger.warn(`⚠️ Alias duplicado '${alias}' ignorado`);
            continue;
          }
          client.aliases.set(alias, cmd.name);
        }
      } catch (err) {
        logger.error(`❌ Error cargando '${f}' en [${cat}]: ${err.message}`);
      }
    }
  }

  buildTree(client, config);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  logger.info(
    `✅ ${client.commands.size} comandos en ${client.categories.size} categorías cargados en ${elapsed}s`
  );
}

fs.watch(commandsPath, { recursive: true }, (evt, file) => {
  if (file && file.endsWith(".js")) {
    logger.info(`♻️ Cambio detectado en ${file}, recargando comandos...`);
    try {
      autoload();
    } catch (e) {
      logger.error("❌ Error en auto-reload:", e);
    }
  }
});

client.on("messageCreate", async (msg) => {
  try {
    if (!msg.author || msg.author.id !== client.user.id) return;
    if (!msg.content.startsWith(PREFIX)) return;

    const args = msg.content.slice(PREFIX.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();
    if (!name) return;

    const cmd =
      client.commands.get(name) || client.commands.get(client.aliases.get(name));
    if (!cmd) return;

    if (cmd.ownerOnly && !config.ownerIds.includes(msg.author.id)) {
      return msg.react("⛔").catch(() => {});
    }
    if (cmd.guildOnly && !msg.guild) {
      return msg.react("🏠").catch(() => {});
    }

    logger.tag(["CMD", cmd.name], "INFO", undefined, `Ejecutando por ${msg.author.tag}`);

    const start = Date.now();
    await cmd.run({ client, msg, args, config, logger });
    const elapsed = Date.now() - start;

    client.stats.commandsUsed++;
    logger.tag(["CMD", cmd.name], "INFO", undefined, `Finalizado en ${elapsed}ms`);
  } catch (e) {
    logger.error("❌ Handler error:", e);
    msg.react("⚠️").catch(() => {});
  }
});

client.once("ready", async () => {
  logger.info(`🤖 Misaki lista como ${client.user.tag} (${client.user.id})`);
  logger.info(
    `📊 Uso: memoria ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`
  );

  await setupPresence(client, config.presence);
});

process.on("unhandledRejection", (r) => logger.error("❌ Unhandled Rejection:", r));
process.on("uncaughtException", (e) => logger.error("❌ Uncaught Exception:", e));
process.on("SIGINT", () => {
  logger.warn("🛑 Interrupción recibida (SIGINT). Cerrando Misaki...");
  process.exit(0);
});
process.on("SIGTERM", () => {
  logger.warn("🛑 Señal SIGTERM recibida. Cerrando Misaki...");
  process.exit(0);
});

autoload();
client.login(process.env.DISCORD_TOKEN);
