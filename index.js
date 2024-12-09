// index.js is used to setup and configure your bot

// Import required packages
const restify = require("restify");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    ConfigurationBotFrameworkAuthentication,
} = require("botbuilder");
const {TeamsBot} = require("./teamsBot");
const config = require("./config");

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const credentialsFactory = new ConfigurationServiceClientCredentialFactory(
    config
);

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    {},
    credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    // Only send error message for user messages, not for other message types so the bot doesn't spam a channel or chat.
    if (context.activity.type === "message") {
        // Send a message to the user
        await context.sendActivity(
            `The bot encountered an unhandled error:\n ${error.message}`
        );
        await context.sendActivity(
            "To continue to run this bot, please fix the bot source code."
        );
    }
};

// Create the bot that will handle incoming messages.
const bot = new TeamsBot();

// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
const port = 443;
server.listen(port, function () {
    console.log(
        `\nBot: ${server.name} listening to ${server.url} running on port ${port}`
    );
});

// Listen for incoming requests.
// server.post("/api/messages", async (req, res) => {
//     await adapter.process(req, res, async (context) => {
//         await bot.run(context);
//     });
// });

server.post("/api/messages", async (req, res) => {
    console.log("Received request at /api/messages:", req.body);
    try {
        await adapter.process(req, res, async (context) => {
            console.log("Processing context:", context.activity);
            await bot.run(context);
        });
    } catch (error) {
        console.error("Error during message processing:", error);
        res.status(500).send("Error processing message");
    }
});

server.get("/", async (req, res) => {
    res.json({
        message: "GET API Endpoint hit",
        MicrosoftAppId: process.env.BOT_ID,
        MicrosoftAppType: process.env.BOT_TYPE,
        MicrosoftAppTenantId: process.env.BOT_TENANT_ID,
        MicrosoftAppPassword: process.env.BOT_PASSWORD,
    });
});

// Gracefully shutdown HTTP server
[
    "exit",
    "uncaughtException",
    "SIGINT",
    "SIGTERM",
    "SIGUSR1",
    "SIGUSR2",
].forEach((event) => {
    process.on(event, () => {
        server.close();
    });
});
