const { Client, GatewayIntentBits } = require("discord.js");

let clientPromise = null;

async function getClient() {
  if (clientPromise) {
    return clientPromise;
  }

  const token = process.env.BOT_TOKEN;

  if (!token) {
    throw new Error("BOT_TOKEN is not configured");
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  clientPromise = client.login(token).then(() => client).catch((error) => {
    clientPromise = null;
    throw error;
  });

  return clientPromise;
}

async function sendMessage(message) {
  const channelId = process.env.CHANNEL_ID;

  if (!channelId) {
    throw new Error("CHANNEL_ID is not configured");
  }

  const client = await getClient();
  const channel = await client.channels.fetch(channelId);

  if (!channel || !channel.isTextBased()) {
    throw new Error("Configured channel is not a text channel");
  }

  await channel.send(message);
}

module.exports = { sendMessage };
