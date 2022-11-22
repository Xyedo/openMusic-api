/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "playlists(id)",
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "song(id)",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_songs");
};
