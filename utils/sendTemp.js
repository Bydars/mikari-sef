module.exports = async function sendTemp(msg, content, delay = 10_000) {
  try {
    const sent = await msg.channel.send(content);

    setTimeout(() => {
      sent.delete().catch((err) => {
        if (
          err.code !== 10008 &&
          err.code !== 50013
        ) {
          console.warn("[sendTemp] Error al eliminar mensaje:", err);
        }
      });
    }, delay);

    return sent;
  } catch (err) {
    console.error("❌ Error al enviar mensaje temporal:", err);
    return null;
  }
};