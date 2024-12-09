const {MemoryStorage, MessageFactory} = require("botbuilder");
const config = require("../config");

// Teams AI Library
const {Application, AI, preview} = require("@microsoft/teams-ai");

// Check for required configuration
if (!config.openAIKey || !config.openAIAssistantId) {
    throw new Error(
        "Missing OPENAI_API_KEY or OPENAI_ASSISTANT_ID. See README.md to prepare your own OpenAI Assistant."
    );
}

const {resetMessage} = require("./messages");
const {httpErrorAction} = require("./actions");

// Create AI components
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

// Log when the bot is added to a conversation (group or personal)
app.conversationUpdate("membersAdded", async (turnContext) => {
    console.log("conversationUpdate: Bot added to a conversation.");

    const welcomeText = "Hi BooksTimer. How can I help you today?";
    for (const member of turnContext.activity.membersAdded) {
        if (member.id !== turnContext.activity.recipient.id) {
            console.log(`Sending welcome message to member ${member.id}`);
            await turnContext.sendActivity(MessageFactory.text(welcomeText));
        }
    }
});

// Log when a message is received
app.message(async (turnContext) => {
    console.log(`Received message from user: ${turnContext.activity.text}`);

    // Get the user's message
    const userMessage = turnContext.activity.text;

    // Send a welcome message when the bot receives a direct message
    if (!turnContext.activity.conversation.isGroup) {
        console.log("Received a direct message, sending welcome.");
        const welcomeText = "Hi BooksTimer. How can I help you today?";
        await turnContext.sendActivity(MessageFactory.text(welcomeText));
    }

    // Handle specific user input like reset
    if (userMessage.toLowerCase() === "reset") {
        console.log("Reset command received.");
        await resetMessage(turnContext, turnContext.state);
    }

    // You can add other message handling logic here
});

// Log specific "reset" messages
app.message("reset", resetMessage);

// Log action handling
app.ai.action(AI.HttpErrorActionName, httpErrorAction);

module.exports = app;
