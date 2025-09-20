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

const sanitize = (s) =>
  String(s).replace(/@/g, "@\u200b").replace(/```/g, "ˋˋˋ");

const block = (text) => FENCE + text + "\n```";

async function sendChunked(msg, text, delay = 10_000) {
  const lines = text.split("\n");
  let buffer = "";

  for (const line of lines) {
    const candidate = buffer ? buffer + "\n" + line : line;
    if (block(candidate).length > LIMIT) {
      await sendTemp(msg, block(buffer), delay);
      buffer = line;
    } else {
      buffer = candidate;
    }
  }
  if (buffer.trim()) await sendTemp(msg, block(buffer), delay);
}

function renderCommandBlock(cmd, prefix) {
  const alias = cmd.aliases?.length ? cmd.aliases.join(", ") : "—";
  return [
    `• **${sanitize(cmd.name)}**${alias !== "—" ? ` (alias: ${sanitize(alias)})` : ""}`,
    `   Uso: \`${prefix}${sanitize(cmd.usage || cmd.name)}\``,
    `   Categoría: ${sanitize(cmd.category || "misc")}`,
    cmd.description ? `   Descripción: ${sanitize(cmd.description)}` : "",
    "",
  ].join("\n");
}

function renderCategory(category, commands, prefix) {
  const icon = CAT_ICONS[String(category).toLowerCase()] || "📂";
  return `${icon} **${category}**\n\n${commands
    .map((c) => renderCommandBlock(c, prefix))
    .join("\n")}`;
}

const normalize = (s) =>
  String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function resolveCommand(client, query) {
  const key = normalize(query);
  return (
    client.commands.find((c) => normalize(c.name) === key) ||
    client.commands.find((c) => (c.aliases || []).some((a) => normalize(a) === key)) ||
    null
  );
}

module.exports = {
  name: "help",
  aliases: ["h", "ayuda"],
  description: "Muestra los comandos disponibles en bloques, por categoría.",
  usage: "help [comando|categoría|? término]",
  category: "utils",

  async run({ client, msg, args }) {
    const prefix = client.prefix;
    const query = args.join(" ").trim();
    const categories = [...client.categories]
      .map((c) => String(c))
      .sort((a, b) => a.localeCompare(b, "es"));

    const all = [...client.commands.values()];

    if (query && !query.startsWith("?")) {
      const cmd = resolveCommand(client, query);
      if (cmd) {
        return sendChunked(msg, `Detalles del comando:\n\n${renderCommandBlock(cmd, prefix)}`);
      }

      const category = categories.find((c) => normalize(c) === normalize(query));
      if (category) {
        const list = all
          .filter((c) => normalize(c.category || "misc") === normalize(category))
          .sort((a, b) => a.name.localeCompare(b.name, "es"));

        if (!list.length) {
          return sendChunked(msg, `No hay comandos en la categoría '${sanitize(category)}'.`);
        }
        return sendChunked(msg, renderCategory(category, list, prefix));
      }

      return sendChunked(msg, `❌ No encontré comando o categoría \`${sanitize(query)}\`.`);
    }

    if (query.startsWith("?")) {
      const term = query.slice(1).trim();
      if (!term) return sendChunked(msg, "Uso: `help ? <término>`");

      const norm = normalize(term);
      const results = all.filter(
        (c) =>
          normalize(c.name).includes(norm) ||
          (c.aliases || []).some((a) => normalize(a).includes(norm)) ||
          normalize(c.description || "").includes(norm)
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
        blocks.push(renderCategory(cat, list, prefix));
      }

      return sendChunked(msg, blocks.join("\n\n").trim());
    }

    const header = [
      `Misaki — Ayuda`,
      `Prefix: \`${prefix}\``,
      `Comandos: ${all.length} • Categorías: ${categories.length}`,
      `Tips: \`${prefix}help <comando>\`, \`${prefix}help <categoría>\`, \`${prefix}help ? <término>\``,
      "",
    ].join("\n");

    await sendChunked(msg, header);

    for (const category of categories) {
      const list = all
        .filter((c) => normalize(c.category || "misc") === normalize(category))
        .sort((a, b) => a.name.localeCompare(b.name, "es"));

      if (list.length) {
        await sendChunked(msg, renderCategory(category, list, prefix));
      }
    }
  },
};
