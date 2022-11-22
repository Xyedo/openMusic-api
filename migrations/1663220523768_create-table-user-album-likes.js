/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint(
    "user_album_likes",
    "unique_album_and_user_id",
    "UNIQUE(album_id, user_id)"
  );
  pgm.addConstraint(
    "user_album_likes",
    "user_album_likes_user_id_fkey",
    "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
  );

  pgm.addConstraint(
    "user_album_likes",
    "user_album_likes_album_id_fkey",
    "FOREIGN KEY (album_id) REFERENCES album(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  pgm.dropTable("user_album_likes");
};
