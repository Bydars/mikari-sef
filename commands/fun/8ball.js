const { randomInt } = require("crypto");

const RESPONSES = [
  "Sí, definitivamente.",
  "No cuentes con ello.",
  "Tal vez...",
  "Sin duda.",
  "Pregunta más tarde.",
  "Mi respuesta es no.",
  "Es probable.",
  "No puedo decirlo ahora.",
  "Claro que sí.",
  "Mis fuentes dicen que no.",
  "Es un misterio.",
  "Afirmativo.",
  "Negativo.",
  "Las señales apuntan a que sí.",
  "Difícil de decir.",
  "Podría ser, pero no ahora.",
  "Posiblemente, aunque incierto.",
  "La suerte no está de tu lado.",
  "Todo indica que sí.",
  "No parece una buena idea.",
];

module.exports = {
  name: "8ball",
  aliases: ["bola8", "bola", "pregunta"],
  description: "Hazle una pregunta a la bola 8 🎱",
  usage: "8ball ¿Me ama?",
  category: "fun",

  async run({ msg, args }) {
    try {
      await msg.delete().catch(() => {});
    } catch {}

    const question = args.join(" ").trim();
    if (!question || !question.endsWith("?")) {
      return msg.temp("❌ La pregunta debe terminar con `?`.", 4000);
    }

    const response = RESPONSES[randomInt(RESPONSES.length)];

    const formatted = [
      "🎱 **Bola 8 dice...**",
      `> ❓ *${question}*`,
      `> 💬 **${response}**`,
    ].join("\n");

    return msg.temp(formatted, 15000);
  },
};
