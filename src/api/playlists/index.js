const PlaylistHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "playlist",
  version: "1.0.0",
  register: async (
    server,
    { playlistService, validator, playlistActivitiesService }
  ) => {
    const notesHandler = new PlaylistHandler(
      playlistService,
      validator,
      playlistActivitiesService
    );
    server.route(routes(notesHandler));
  },
};
