/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(
    `ALTER TABLE 
      playlist_songs 
    DROP CONSTRAINT 
      playlist_songs_playlist_id_fkey, 
    ADD CONSTRAINT 
      playlist_songs_playlist_id_fkey 
      FOREIGN KEY (playlist_id) 
      REFERENCES playlists(id) 
      ON DELETE CASCADE`
  );
};
