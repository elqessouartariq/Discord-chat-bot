require("dotenv/config");
const { Client, IntentsBitField } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
});

client.on("ready", () => {
	console.log(`Logged in as ${client.user.username}!`);
});

const configuration = new Configuration({
	apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	if (message.channel.id !== process.env.CHANNEL_ID) return;
	if (message.content.startsWith("!")) return;

	const getPreviousMessages = async (channelId) => {
		const messages = await channel.messages.fetch({ limit: 15 });
		messages.reverse();
		return messages;
	};

	const conversationLog = await getPreviousMessages(message.channel.id);

	const messages = conversationLog.map((msg) => ({
		role: msg.author.bot ? "assistant" : "user",
		content: msg.content,
		name: msg.author.username.replace(/\s+/g, "_").replace(/[^\w\s]/gi, ""),
	}));

	try {
		await message.channel.sendTyping();
		const result = await openai
			.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages,
			})
			.catch((error) => {
				console.log(`OPENAI ERR: ${error}`);
			});
		message.reply(result.data.choices[0].message);
	} catch (error) {
		console.log(`ERR: ${error}`);
	}
});

client.login(process.env.TOKEN);
