const {AI} = require("@microsoft/teams-ai");

async function httpErrorAction(context, state, data) {
    await context.sendActivity("An AI request failed. Please try again later.");
    return AI.StopCommandName;
}

module.exports = {
    httpErrorAction,
};
