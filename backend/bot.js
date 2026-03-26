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

async function sendMessage(message, options = {}) {
  const channelId = process.env.CHANNEL_ID;
  const { mentionEveryone = false, tts = false } = options;

  if (!channelId) {
    throw new Error("CHANNEL_ID is not configured");
  }

  const client = await getClient();
  const channel = await client.channels.fetch(channelId);

  if (!channel || !channel.isTextBased()) {
    throw new Error("Configured channel is not a text channel");
  }

  const content = String(message).trim();

  if (!content) {
    throw new Error("Message content is required");
  }

  await channel.send({
    content: mentionEveryone ? `@everyone ${content}` : content,
    tts,
    allowedMentions: mentionEveryone ? { parse: ["everyone"] } : undefined,
  });
}

async function sendRSVPMessage(message, options = {}) {
  const channelId = process.env.CHANNEL_2_ID;
  const { mentionEveryone = false, tts = false } = options;

  if (!channelId) {
    throw new Error("CHANNEL_2_ID is not configured");
  }

  const client = await getClient();
  const channel = await client.channels.fetch(channelId);

  if (!channel || !channel.isTextBased()) {
    throw new Error("Configured channel is not a text channel");
  }

  const content = String(message).trim();

  if (!content) {
    throw new Error("Message content is required");
  }

  await channel.send({
    content: mentionEveryone ? `@everyone ${content}` : content,
    tts,
    allowedMentions: mentionEveryone ? { parse: ["everyone"] } : undefined,
  });
}

module.exports = { sendMessage , sendRSVPMessage };
