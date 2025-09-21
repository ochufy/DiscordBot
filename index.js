require('dotenv/config');
const { Client, IntentsBitField } = require("discord.js");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const token = process.env.DISCORD_BOT_TOKEN;

// Instagram reel URL regex
const instagramReelRegex =
  /https?:\/\/(www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)/i;

client.once("clientReady", () => {
  console.log("Bot is online!");
});

client.on("messageCreate", (message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;

  // Check if the message contains an Instagram reel link
  const match = message.content.match(instagramReelRegex);
  if (match) {
    // Extract the reel ID from the URL
    const reelId = match[2];

    // Create the modified link
    const modifiedLink = `https://www.vxinstagram.com/reel/${reelId}`;

    // Send the modified link as a message
    message.channel.send(modifiedLink);
  }
});

// Log in to Discord with your app's token
client.login(token);

// Export a simple HTTP handler for serverless function
module.exports = (req, res) => {
  res.status(200).send("Discord bot is running!");
};