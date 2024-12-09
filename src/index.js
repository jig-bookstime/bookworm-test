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
    });
});

server.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, async (context) => {
        await app.run(context);
    });
});
