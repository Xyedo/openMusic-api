/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("playlists", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    name: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      references: "users(id)",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlists");
};
