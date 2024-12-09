const restify = require("restify");

const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    ConfigurationBotFrameworkAuthentication,
} = require("botbuilder");
const {TeamsBot} = require("./teamsBot");
const config = require("./config");

// Create adapter
const credentialsFactory = new ConfigurationServiceClientCredentialFactory(
    config
);

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    {},
    credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
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

// Listen on proper port
server.listen(port, () => {
    console.log(`\nBot server listening on port ${port}`);
});

// Main bot message endpoint
server.post("/api/messages", async (req, res) => {
    console.log("Received request at /api/messages:", {
        type: req.body.type,
        text: req.body.text,
        timestamp: new Date().toISOString(),
    });

    try {
        await adapter.process(req, res, async (context) => {
            await bot.run(context);
        });
    } catch (error) {
        console.error("Error processing message:", error);
        res.status(500).json({
            error: "Error processing message",
            details: error.message,
        });
    }
});

// Health check endpoint
server.get("/health", async (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});

// Diagnostic endpoint
server.get("/api/config", async (req, res) => {
    res.json({
        botId: process.env.BOT_ID ? "Configured" : "Missing",
        tenantId: process.env.BOT_TENANT_ID ? "Configured" : "Missing",
        appType: process.env.BOT_TYPE ? "Configured" : "Missing",
        port: port,
        nodeVersion: process.version,
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
