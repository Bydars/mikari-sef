const fs = require("fs");
const path = require("path");
const logger = require("./logger");

function buildTree(client, config) {
  const tree = {};
  for (const [name, cmd] of client.commands) {
    const cat = cmd.category || "misc";
    if (!tree[cat]) tree[cat] = [];
    tree[cat].push({
      name,
      aliases: cmd.aliases,
      description: cmd.description || "",
      usage: cmd.usage || "",
    });
  }

  let md = `# Misaki Commands\n\n> Prefix: \`${config.prefix}\`\n\n`;
  for (const cat of Object.keys(tree)) {
    md += `## ${cat}\n\n`;
    for (const c of tree[cat]) {
      const alias = c.aliases.length ? ` _(aliases: ${c.aliases.join(", ")})_` : "";
      const desc = c.description ? ` — ${c.description}` : "";
      const usage = c.usage ? `\n   \`${config.prefix}${c.usage}\`` : "";
      md += `- **${c.name}**${alias}${desc}${usage}\n`;
    }
    md += "\n";
  }

  try {
    fs.writeFileSync(path.join(process.cwd(), "COMMANDS.md"), md);
    logger.info("COMMANDS.md actualizado.");
  } catch (e) {
    logger.warn("No se pudo escribir COMMANDS.md:", e.message);
  }
}

module.exports = { buildTree };
