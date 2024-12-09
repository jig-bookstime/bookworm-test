const restify = require("restify");
// This bot's adapter
const adapter = require("./adapter");
// This bot's main dialog.
const app = require("./app/app");

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

server.get("/", async (req, res) => {
    res.json({
        message: "success",
        MicrosoftAppId: process.env.BOT_ID,
        MicrosoftAppType: process.env.BOT_TYPE,
        MicrosoftAppTenantId: process.env.BOT_TENANT_ID,
        MicrosoftAppPassword: process.env.BOT_PASSWORD,
        openAIKey: process.env.OPENAI_API_KEY,
        openAIAssistantId: process.env.OPENAI_ASSISTANT_ID,
        port: process.env.PORT,
    });
});

server.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, async (context) => {
        await app.run(context);
    });
});
