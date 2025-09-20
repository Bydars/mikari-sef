const fs = require("fs");
const path = require("path");
const logger = require("./logger");

function buildTree(client, config) {
  const enabled = String(process.env.BOT_WRITE_COMMAND_DOCS).toLowerCase() === "true";

  if (!enabled) {
    logger.info("📄 Generación de COMMANDS.md desactivada por configuración (.env)");
    return;
  }

  const tree = {};

  for (const [name, cmd] of client.commands.entries()) {
    const category = cmd.category || "misc";
    if (!tree[category]) tree[category] = [];

    tree[category].push({
      name,
      aliases: Array.isArray(cmd.aliases) ? cmd.aliases : [],
      description: cmd.description || "",
      usage: cmd.usage || "",
    });
  }

  const sortedCategories = Object.keys(tree).sort();
  for (const cat of sortedCategories) {
    tree[cat].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  const lines = [
    `# 📘 Misaki — Lista de Comandos`,
    ``,
    `> **Prefix actual:** \`${config.prefix || "."}\``,
    `> Total de comandos: **${client.commands.size}**`,
    ``
  ];

  for (const category of sortedCategories) {
    lines.push(`## 🗂️ ${capitalize(category)}`, ``);

    for (const cmd of tree[category]) {
      const alias = cmd.aliases.length ? ` _(alias: ${cmd.aliases.join(", ")})_` : "";
      const desc = cmd.description ? ` — ${cmd.description}` : "";
      const usage = cmd.usage ? `\n> Uso: \`${config.prefix}${cmd.usage}\`` : "";

      lines.push(`- **${cmd.name}**${alias}${desc}${usage}`);
    }

    lines.push("");
  }

  const outPath = path.join(process.cwd(), "COMMANDS.md");
  try {
    fs.writeFileSync(outPath, lines.join("\n").trim() + "\n", "utf8");
    logger.info("✅ Archivo COMMANDS.md generado correctamente.");
  } catch (err) {
    logger.error("❌ Error al escribir COMMANDS.md:", err.message);
  }
}

function capitalize(str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

module.exports = { buildTree };
