module.exports = {
  name: "purge",
  aliases: ["clear", "del"],
  description: "Elimina una cantidad de mensajes recientes (máx 100).",
  usage: "purge <cantidad>",
  category: "general",

  async run({ msg, args, logger }) {
    try {
      if (msg.deletable) msg.delete().catch(() => {});

      const amount = parseInt(args[0]);
      if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
        return msg.temp("❌ Ingresa un número entre 1 y 100.", 4000);
      }

      const channel = msg.channel;

      const messages = await channel.messages.fetch({ limit: amount + 1 });
      const toDelete = messages
        .filter((m) => m.author.id === msg.client.user.id)
        .first(amount);

      if (!toDelete.length) {
        return msg.temp("⚠️ No hay mensajes tuyos recientes para eliminar.", 4000);
      }

      for (const m of toDelete) {
        await m.delete().catch(() => {});
        await new Promise((r) => setTimeout(r, 200));
      }

      await msg.channel.send(
        `🧹 Eliminados \`${toDelete.length}\` mensaje(s).`
      ).then((m) => setTimeout(() => m.delete().catch(() => {}), 4000));

      logger.info(`✅ Purge completado: ${toDelete.length} mensajes.`);
    } catch (err) {
      logger.error("💥 Error en comando purge:", err);
      await msg.react("⚠️").catch(() => {});
    }
  },
};
