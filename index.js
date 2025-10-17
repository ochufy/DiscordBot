require("dotenv/config");
const express = require("express");
const { Client, IntentsBitField } = require("discord.js");
// Create an Express app
const app = express();
const port = process.env.PORT || 4000;

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

// Variable to track the "goodnight" count and the time window
let goodnightCount = 0;
let lastCountResetTime = Date.now();

const resetGoodnightCount = () => {
  goodnightCount = 0;
  lastCountResetTime = Date.now();
};

// Check if it's time to reset the count (8:00 PM daily)
const checkAndResetAt8PM = () => {
  // Get current time
  const currentTime = new Date();

  // Set target time to 8:00 PM today
  const targetTime = new Date();
  targetTime.setHours(20, 0, 0, 0); // 8:00 PM

  // If current time is past 8:00 PM, reset the count
  if (currentTime >= targetTime) {
    resetGoodnightCount();
  }
};

// Set an interval to check every minute if it's 8:00 PM to reset the count
setInterval(() => {
  checkAndResetAt8PM();
}, 60 * 1000); // Check every minute

client.on("messageCreate", (message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;

  // Check if the message contains an Instagram reel link
  const match = message.content.match(instagramReelRegex);
  if (match) {
    // Extract the reel ID from the URL
    const reelId = match[2];

    // Create the modified link
    const modifiedLink = `https://www.d.vxinstagram.com/reel/${reelId}`;

    // Send the modified link as a message
    message.channel.send(modifiedLink);
  }

  if (message.content.includes(process.env.MESSAGE_SUBSTRING)) {
    const targetChannel = message.guild.channels.cache.get(
      process.env.TARGET_CHANNEL_FOR_LOGGING
    );

    if (targetChannel) {
      // Generate the link to the original message
      const messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;

      // Send the message with the link to the target channel
      const messageToSend = `Message from **${message.author.displayName}** in **#${message.channel.name}**: \n${message.content}\n${messageLink}`;
      targetChannel.send(messageToSend); // Send the modified message to the target channel
    } else {
      console.log("Target channel not found.");
    }
  }

  // Check if the message is from the target user
  if (message.author.id === process.env.TARGET_USER_ID) {
    // Check for "goodnight" or "good night"
    if (/(good\s?night)/i.test(message.content)) {
      // Increment the goodnight count
      goodnightCount++;

      // Send the current count of "goodnight" messages
      message.channel.send(
        `That's ${message.author.displayName}'s goodnight no. ${goodnightCount}.`
      );

      // Check and reset count if 24 hours have passed
      checkAndResetAt8PM();
    }
  }
});

// Log in to Discord with your app's token
client.login(token);

// Add a route for your server to handle HTTP requests
app.get("/", (req, res) => {
  res.status(200).send("Discord bot is running!");
});

// Start the Express server and listen on a port
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
