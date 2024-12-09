const {MemoryStorage, MessageFactory} = require("botbuilder");
const config = require("../config");

// See https://aka.ms/teams-ai-library to learn more about the Teams AI library.
const {Application, AI, preview} = require("@microsoft/teams-ai");

// See README.md to prepare your own OpenAI Assistant
if (!config.openAIKey || !config.openAIAssistantId) {
    throw new Error(
        "Missing OPENAI_API_KEY or OPENAI_ASSISTANT_ID. See README.md to prepare your own OpenAI Assistant."
    );
}

const {resetMessage} = require("./messages");
// const {httpErrorAction, getCurrentWeather, getNickname} = require("./actions");
const {httpErrorAction} = require("./actions");

// Create AI components
// Use OpenAI
const planner = new preview.AssistantsPlanner({
    apiKey: config.openAIKey,
    assistant_id: config.openAIAssistantId,
});

// Define storage and application
const storage = new MemoryStorage();
const app = new Application({
    storage,
    ai: {
        planner,
    },
});

app.conversationUpdate("membersAdded", async (turnContext) => {
    const welcomeText = "Hi BooksTimer. How can I help you today?";
    for (const member of turnContext.activity.membersAdded) {
        if (member.id !== turnContext.activity.recipient.id) {
            await turnContext.sendActivity(MessageFactory.text(welcomeText));
        }
    }
});

app.message("reset", resetMessage);

app.ai.action(AI.HttpErrorActionName, httpErrorAction);

module.exports = app;
