const { Client, Collection } = require("discord.js-selfbot-v13");
const fs = require("fs");
const path = require("path");

const logger = require("./utils/logger");
const { buildTree } = require("./utils/tree");
const { setupPresence } = require("./utils/presence");
const config = require("./configs/config.json");

const PREFIX = config.prefix || ".";

const token = process.env.DISCORD_TOKEN;
const tokenPattern = /^[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{6,}\.[A-Za-z0-9_\-]{27,}$/;
if (!token || !tokenPattern.test(token)) {
  logger.error("❌ Token inválido o ausente en .env");
  process.exit(1);
}

const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) {
  logger.error("❌ Carpeta 'commands/' no encontrada");
  process.exit(1);
}

const client = new Client({ checkUpdate: false });
client.prefix = PREFIX;
client.commands = new Collection();
client.aliases = new Collection();
client.categories = new Set();
client.stats = { commandsUsed: 0, startedAt: Date.now() };

function loadCommands() {
  const start = Date.now();
  client.commands.clear();
  client.aliases.clear();
  client.categories.clear();

  const categories = fs
    .readdirSync(commandsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const files = fs
      .readdirSync(path.join(commandsPath, category))
      .filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const fullPath = path.join(commandsPath, category, file);

      try {
        delete require.cache[require.resolve(fullPath)];
        const cmd = require(fullPath);

        if (!cmd?.name || typeof cmd.run !== "function") {
          logger.warn(`⚠️ Ignorado '${file}' (falta name/run)`);
          continue;
        }

        if (client.commands.has(cmd.name)) {
          logger.warn(`⚠️ Comando duplicado '${cmd.name}'`);
          continue;
        }

        cmd.category = (cmd.category || category || "misc").toLowerCase();
        cmd.aliases = Array.isArray(cmd.aliases) ? cmd.aliases : [];
        cmd.ownerOnly = !!cmd.ownerOnly;
        cmd.guildOnly = !!cmd.guildOnly;

        client.commands.set(cmd.name, cmd);
        client.categories.add(cmd.category);

        for (const alias of cmd.aliases) {
          if (client.aliases.has(alias)) {
            logger.warn(`⚠️ Alias duplicado '${alias}' ignorado`);
            continue;
          }
          client.aliases.set(alias, cmd.name);
        }
      } catch (err) {
        logger.error(`❌ Error cargando '${file}' en [${category}]: ${err.message}`);
      }
    }
  }

  buildTree(client, config);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  logger.info(
    `✅ Cargados ${client.commands.size} comandos en ${client.categories.size} categorías (${elapsed}s)`
  );
}

fs.watch(commandsPath, { recursive: true }, (_event, file) => {
  if (file?.endsWith(".js")) {
    logger.info(`♻️ Cambio detectado en '${file}', recargando comandos...`);
    try {
      loadCommands();
    } catch (err) {
      logger.error("❌ Error en recarga:", err);
    }
  }
});

client.on("messageCreate", async (msg) => {
  try {
    if (!msg.author || msg.author.id !== client.user.id) return;
    if (!msg.content.startsWith(client.prefix)) return;

    const args = msg.content.slice(client.prefix.length).trim().split(/\s+/);
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

    logger.tag(["CMD", cmd.name], "INFO", undefined, `Ejecutado por ${msg.author.tag}`);
    const start = Date.now();

    await cmd.run({ client, msg, args, config, logger });

    client.stats.commandsUsed++;
    const elapsed = Date.now() - start;
    logger.tag(["CMD", cmd.name], "INFO", undefined, `Finalizado en ${elapsed}ms`);
  } catch (err) {
    logger.error("❌ Error al ejecutar comando:", err);
    msg.react("⚠️").catch(() => {});
  }
});

client.once("ready", async () => {
  logger.info(`🤖 Conectado como ${client.user.tag} (${client.user.id})`);
  logger.info(
    `📊 Memoria usada: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`
  );
  await setupPresence(client, config.presence);
});

process.on("unhandledRejection", (r) =>
  logger.error("❌ Unhandled Rejection:", r)
);
process.on("uncaughtException", (e) =>
  logger.error("❌ Uncaught Exception:", e)
);

process.on("SIGINT", () => {
  logger.warn("🛑 SIGINT recibido. Saliendo...");
  process.exit(0);
});
process.on("SIGTERM", () => {
  logger.warn("🛑 SIGTERM recibido. Saliendo...");
  process.exit(0);
});

loadCommands();
client.login(token);
