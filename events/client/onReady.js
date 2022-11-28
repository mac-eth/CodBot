module.exports = {
  name: "ready",
  once: true,

  async execute(client) {
    try {
      client.user.setPresence({
        activities: [
          {
            name: "Mac is a God COD Player",
            type: "WATCHING",
          },
        ],
        status: "online",
      });
      console.log("Bot is online");
    } catch (error) {
      console.log(error);
    }
  },
};
