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
  return String(s ?? "")
    .replace(/@/g, "@\u200b")
    .replace(/```/g, "ˋˋˋ");
}

function block(txt) {
  return FENCE + txt + "\n```";
}

async function sendChunked(msg, text, delay = 10_000) {
  const lines = text.split("\n");
  let buf = "";

  for (const line of lines) {
    const tryBlock = buf ? buf + "\n" + line : line;

    if (block(tryBlock).length > LIMIT) {
      await sendTemp(msg, block(buf), delay);
      buf = line;
    } else {
      buf = tryBlock;
    }
  }

  if (buf.trim()) {
    await sendTemp(msg, block(buf), delay);
  }
}

function renderCommandBlock(prefix, cmd) {
  const alias = cmd.aliases?.length ? cmd.aliases.join(", ") : "—";
  return (
    `• **${sanitize(cmd.name)}**` +
    (alias !== "—" ? ` (alias: ${sanitize(alias)})` : "") +
    `\n   Uso: \`${prefix}${sanitize(cmd.usage || cmd.name)}\`` +
    `\n   Categoría: ${sanitize(cmd.category || "misc")}` +
    (cmd.description ? `\n   Descripción: ${sanitize(cmd.description)}` : "") +
    `\n`
  );
}

function renderCategory(prefix, category, commands) {
  const icon = CAT_ICONS[category?.toLowerCase()] || "📂";
  let out = `${icon} **${category}**\n\n`;
  for (const cmd of commands) {
    out += renderCommandBlock(prefix, cmd) + "\n";
  }
  return out.trim();
}

function normalize(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveCommand(client, q) {
  const key = normalize(q);
  const byName = [...client.commands.values()].find((c) => normalize(c.name) === key);
  if (byName) return byName;
  const byAlias = [...client.commands.values()].find((c) =>
    (c.aliases || []).some((a) => normalize(a) === key)
  );
  return byAlias || null;
}

module.exports = {
  name: "help",
  aliases: ["h", "ayuda"],
  description: "Muestra los comandos disponibles en bloques, por categoría.",
  usage: "help [comando|categoría|? término]",
  category: "general",

  async run({ client, msg, args, config }) {
    const prefix = config?.prefix || ".";
    const query = args.join(" ").trim();

    if (query && !query.startsWith("?")) {
      const cmd = resolveCommand(client, query);
      if (cmd) {
        const text = renderCommandBlock(prefix, cmd);
        return sendChunked(msg, `Detalles del comando:\n\n${text}`);
      }

      const categories = Array.from(client.categories);
      const target = categories.find((c) => normalize(c) === normalize(query));
      if (target) {
        const list = [...client.commands.values()]
          .filter((c) => (c.category || "misc") === target)
          .sort((a, b) => a.name.localeCompare(b.name, "es"));
        if (!list.length) {
          return sendChunked(msg, `No hay comandos en la categoría '${sanitize(target)}'.`);
        }
        return sendChunked(msg, renderCategory(prefix, target, list));
      }

      return sendChunked(msg, `❌ No encontré comando o categoría \`${sanitize(query)}\`.`);
    }

    if (query.startsWith("?")) {
      const term = query.slice(1).trim();
      if (!term) return sendChunked(msg, "Uso: `help ? <término>`");

      const normTerm = normalize(term);
      const results = [...client.commands.values()].filter((c) => {
        return (
          normalize(c.name).includes(normTerm) ||
          (c.aliases || []).some((a) => normalize(a).includes(normTerm)) ||
          normalize(c.description || "").includes(normTerm)
        );
      });

      if (!results.length) {
        return sendChunked(msg, `No se encontraron comandos que coincidan con '${sanitize(term)}'.`);
      }

      const byCat = new Map();
      for (const c of results) {
        const cat = c.category || "misc";
        if (!byCat.has(cat)) byCat.set(cat, []);
        byCat.get(cat).push(c);
      }

      let text = `Resultados para '${sanitize(term)}' (prefix: \`${prefix}\`)\n\n`;
      for (const [cat, list] of byCat.entries()) {
        text += renderCategory(prefix, cat, list) + "\n\n";
      }
      return sendChunked(msg, text.trim());
    }

    const categories = Array.from(client.categories).sort((a, b) =>
      a.localeCompare(b, "es")
    );
    const allCmds = [...client.commands.values()];

    let header =
      `Misaki — Ayuda\n` +
      `Prefix: \`${prefix}\`\n` +
      `Comandos: ${allCmds.length} • Categorías: ${categories.length}\n` +
      `Tips: \`${prefix}help <comando>\`, \`${prefix}help <categoría>\`, \`${prefix}help ? <término>\`\n\n`;

    await sendChunked(msg, header);

    for (const cat of categories) {
      const list = allCmds
        .filter((c) => (c.category || "misc") === cat)
        .sort((a, b) => a.name.localeCompare(b.name, "es"));
      if (!list.length) continue;
      await sendChunked(msg, renderCategory(prefix, cat, list));
    }
  },
};
