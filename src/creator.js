const {preview} = require("@microsoft/teams-ai");

const openAIKey = process.argv[2];
if (!openAIKey) {
    throw new Error("Missing input OpenAI Key");
}

// Create new Assistant
(async () => {
    const assistant = await preview.AssistantsPlanner.createAssistant(
        openAIKey,
        {
            name: "BookWorm",
            instructions: [
                "You are an intelligent bot, named BookWorm, that can:",
                "- Assist bookkeepers and client service advisors with queries.",
                "- Provide sales support and management insights.",
                "- Use the provided functions to answer questions.",
                "- Advise staff at BooksTime, a bookkeeping company, and answer their questions, and help them draft emails",
            ].join("\n"),
            // model: "gpt-4-turbo",
            model: "gpt-4o-mini",
        }
    );

    console.log(`Created a new assistant with an ID of: ${assistant.id}`);
})();
