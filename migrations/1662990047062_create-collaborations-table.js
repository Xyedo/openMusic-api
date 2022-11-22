/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("collaborations", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
  pgm.addConstraint(
    "collaborations",
    "collaborations_playlists_id_fkey",
    "FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
  );
  pgm.addConstraint(
    "collaborations",
    "collaborations_users_id_fkey",
    "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  pgm.dropTable("collaborations");
};
