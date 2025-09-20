const sendTemp = require("../../utils/sendTemp");

const CAT_ICONS = {
  general: "🧭",
  utils: "🛠️",
  admin: "🔒",
  fun: "🎲",
  media: "🖼️",
  owner: "👑",
};

const LIMIT = 1900;
const FENCE = "```md\n";

function sanitize(s) {
  return String(s)
    .replace(/@/g, "@\u200b")
    .replace(/```/g, "ˋˋˋ");
}

function block(text) {
  return FENCE + text + "\n```";
}

async function sendChunked(msg, text, delay = 10_000) {
  const lines = text.split("\n");
  let buffer = "";

  for (const line of lines) {
    const test = buffer ? buffer + "\n" + line : line;

    if (block(test).length > LIMIT) {
      await sendTemp(msg, block(buffer), delay);
      buffer = line;
    } else {
      buffer = test;
    }
  }

  if (buffer.trim()) {
    await sendTemp(msg, block(buffer), delay);
  }
}

function renderCommandBlock(prefix, cmd) {
  const alias = cmd.aliases?.length ? cmd.aliases.join(", ") : "—";

  return [
    `• **${sanitize(cmd.name)}**${alias !== "—" ? ` (alias: ${sanitize(alias)})` : ""}`,
    `   Uso: \`${prefix}${sanitize(cmd.usage || cmd.name)}\``,
    `   Categoría: ${sanitize(cmd.category || "misc")}`,
    cmd.description ? `   Descripción: ${sanitize(cmd.description)}` : "",
    ""
  ].join("\n");
}

function renderCategory(prefix, category, commands) {
  const icon = CAT_ICONS[category.toLowerCase()] || "📂";
  const blocks = commands.map((cmd) => renderCommandBlock(prefix, cmd));
  return `${icon} **${category}**\n\n${blocks.join("\n")}`;
}

function normalize(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveCommand(client, query) {
  const key = normalize(query);
  return (
    [...client.commands.values()].find((c) => normalize(c.name) === key) ||
    [...client.commands.values()].find((c) =>
      (c.aliases || []).some((a) => normalize(a) === key)
    ) || null
  );
}

module.exports = {
  name: "help",
  aliases: ["h", "ayuda"],
  description: "Muestra los comandos disponibles en bloques, por categoría.",
  usage: "help [comando|categoría|? término]",
  category: "utils",

  async run({ client, msg, args, config }) {
    const prefix = config?.prefix || ".";
    const query = args.join(" ").trim();
    const categories = Array.from(client.categories).sort((a, b) =>
      a.localeCompare(b, "es")
    );
    const allCommands = [...client.commands.values()];

    if (query && !query.startsWith("?")) {
      const cmd = resolveCommand(client, query);
      if (cmd) {
        const text = renderCommandBlock(prefix, cmd);
        return sendChunked(msg, `Detalles del comando:\n\n${text}`);
      }

      const category = categories.find((c) => normalize(c) === normalize(query));
      if (category) {
        const list = allCommands
          .filter((c) => (c.category || "misc") === category)
          .sort((a, b) => a.name.localeCompare(b.name, "es"));
        if (!list.length) {
          return sendChunked(msg, `No hay comandos en la categoría '${sanitize(category)}'.`);
        }
        return sendChunked(msg, renderCategory(prefix, category, list));
      }

      return sendChunked(msg, `❌ No encontré comando o categoría \`${sanitize(query)}\`.`);
    }

    if (query.startsWith("?")) {
      const term = query.slice(1).trim();
      if (!term) return sendChunked(msg, "Uso: `help ? <término>`");

      const normTerm = normalize(term);
      const results = allCommands.filter((c) =>
        normalize(c.name).includes(normTerm) ||
        (c.aliases || []).some((a) => normalize(a).includes(normTerm)) ||
        normalize(c.description || "").includes(normTerm)
      );

      if (!results.length) {
        return sendChunked(msg, `No se encontraron comandos que coincidan con '${sanitize(term)}'.`);
      }

      const byCat = new Map();
      for (const cmd of results) {
        const cat = cmd.category || "misc";
        if (!byCat.has(cat)) byCat.set(cat, []);
        byCat.get(cat).push(cmd);
      }

      const blocks = [`Resultados para '${sanitize(term)}' (prefix: \`${prefix}\`)`];
      for (const [cat, list] of byCat.entries()) {
        blocks.push(renderCategory(prefix, cat, list));
      }

      return sendChunked(msg, blocks.join("\n\n").trim());
    }

    const header = [
      `Misaki — Ayuda`,
      `Prefix: \`${prefix}\``,
      `Comandos: ${allCommands.length} • Categorías: ${categories.length}`,
      `Tips: \`${prefix}help <comando>\`, \`${prefix}help <categoría>\`, \`${prefix}help ? <término>\``,
      ""
    ].join("\n");

    await sendChunked(msg, header);

    for (const category of categories) {
      const list = allCommands
        .filter((c) => (c.category || "misc") === category)
        .sort((a, b) => a.name.localeCompare(b.name, "es"));
      if (!list.length) continue;
      await sendChunked(msg, renderCategory(prefix, category, list));
    }
  },
};
