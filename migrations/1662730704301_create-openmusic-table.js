/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("album", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    name: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "SMALLINT",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
    updated_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
  });
  pgm.createTable("song", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "SMALLINT",
      notNull: true,
    },
    genre: {
      type: "TEXT",
      notNull: true,
    },
    performer: {
      type: "TEXT",
      notNull: true,
    },
    duration: {
      type: "SMALLINT",
      notNull: false,
    },
    album_id: {
      type: "VARCHAR(50)",
      references: "album(id)",
      notNull: false,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
    updated_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("song");
  pgm.dropTable("album");
};
