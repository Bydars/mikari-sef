const { format, formatDistanceToNowStrict } = require("date-fns");

module.exports = {
  name: "whoami",
  aliases: ["me", "yo", "account"],
  description: "Muestra toda la información detallada de tu cuenta.",
  usage: "whoami",
  category: "utils",

  async run({ msg }) {
    await msg.delete().catch(() => {});
    const u = msg.client.user;
    
    const makeBoxHeader = (title = "") => {
      const clean = ` ${title.trim()} `;
      const width = clean.length + 4;
      const top = `\u001b[1;36m╔${"═".repeat(width)}╗`;
      const mid = `║\u001b[1;34m${clean.padEnd(width)}\u001b[1;36m║`;
      const bot = `╚${"═".repeat(width)}╝\u001b[0m`;
      return [top, mid, bot].join("\n");
    };

    const createdAt = u.createdAt;
    const createdDate = format(createdAt, "yyyy-MM-dd HH:mm:ss");
    const age = formatDistanceToNowStrict(createdAt);
    const tag = `${u.username}#${u.discriminator}`;
    const avatarHash = u.avatar || "None";
    const bannerURL = u.bannerURL?.({ dynamic: true, size: 4096 }) || "No disponible";
    const bannerHash = u.banner || "None";
    const bio = u.bio || "Sin bio.";
    const flags = u.flags?.toArray?.() || [];
    const flagsRaw = u.flags?.bitfield ?? 0;
    const nitro = (u.premiumType > 0 || u.avatar?.startsWith("a_")) ? "✅ Sí" : "❌ No";
    const status = u.presence?.status || "offline";
    const devices = u.presence?.clientStatus ? Object.keys(u.presence.clientStatus).join(", ") : "No visible";
    const email = u.email || "[No accesible]";
    const phone = u.phone || "[No accesible]";
    const locale = u.locale || "desconocido";
    const verified = u.verified ? "✅ Sí" : "❌ No";
    const mfa = u.mfaEnabled ? "✅ Sí" : "❌ No";
    const tokenStatus = process.env.DISCORD_TOKEN ? "✅ Configurado" : "❌ No encontrado";
    const avatarIsAnimated = u.avatar?.startsWith("a_") ? "Sí" : "No";
    const avatarExt = avatarIsAnimated === "Sí" ? ".gif" : ".png";
    const avatarCDN = `https://cdn.discordapp.com/avatars/${u.id}/${avatarHash}${avatarExt}?size=4096`;

    const info = [
      "```ansi",
      makeBoxHeader("INFO DE LA CUENTA — SELF WHOAMI"),
      "",
      "\u001b[1;33m👤 IDENTIDAD",
      `\u001b[1;33m🆔 ID:                  \u001b[0m${u.id}`,
      `\u001b[1;33m🔗 Usuario:             \u001b[0m${tag}`,
      `\u001b[1;33m📅 Creación:            \u001b[0m${createdDate} (${age})`,
      `\u001b[1;33m✅ Verificada:          \u001b[0m${verified}`,
      `\u001b[1;33m🔒 2FA:                 \u001b[0m${mfa}`,
      "",
      "\u001b[1;31m🎨 VISUALES",
      `\u001b[1;33m🎞️ Avatar animado:      \u001b[0m${avatarIsAnimated}`,
      `\u001b[1;33m🎨 Avatar hash:         \u001b[0m${avatarHash}`,
      `\u001b[1;33m🌐 Avatar CDN:          \u001b[0m${avatarCDN}`,
      `\u001b[1;33m🌄 Banner URL:          \u001b[0m${bannerURL}`,
      `\u001b[1;33m🎨 Banner hash:         \u001b[0m${bannerHash}`,
      "",
      "\u001b[1;35m📝 PERFIL",
      `\u001b[1;33m📖 Bio:                 \u001b[0m${bio}`,
      `\u001b[1;33m🚩 Flags:               \u001b[0m${flags.length ? flags.join(", ") : "Ninguna"}`,
      `\u001b[1;33m🧬 Flags RAW:           \u001b[0m${flagsRaw}`,
      `\u001b[1;33m💠 Nitro:               \u001b[0m${nitro}`,
      `\u001b[1;33m📶 Estado:              \u001b[0m${status}`,
      `\u001b[1;33m📱 Dispositivos:        \u001b[0m${devices}`,
      "",
      "\u001b[1;36m👥 RELACIONES",
      `\u001b[1;33m👫 Amigos:              \u001b[0mN/A`,
      `\u001b[1;33m🚫 Bloqueados:          \u001b[0mN/A`,
      "",
      "\u001b[1;31m🔐 DATOS SENSIBLES",
      `\u001b[1;33m📧 Email:               \u001b[0m${email}`,
      `\u001b[1;33m📞 Teléfono:            \u001b[0m${phone}`,
      `\u001b[1;33m🌍 Locale:              \u001b[0m${locale}`,
      `\u001b[1;33m🔑 Token (.env):        \u001b[0m${tokenStatus}`,
      "```"
    ].join("\n");

    return msg.temp(info, 40000);
  },
};
