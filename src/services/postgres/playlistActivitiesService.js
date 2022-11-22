const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/invariantError");
const NotFoundError = require("../../exceptions/notFoundError");

const playlistActivitiesNotFound = "Tidak dapat menemukan playlist activities";
const addActivitiesFailed = "Gagal Menambahkan Aktivitas";

class PlaylistActivitiesService {
  constructor() {
    this.pool = new Pool();
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT 
        playlist_song_activities.playlist_id AS "playlistId",  
        users.username, 
        song.title, 
        playlist_song_activities."action", 
        playlist_song_activities.time 
      FROM playlist_song_activities 
      JOIN users 
        ON playlist_song_activities.user_id = users.id 
      JOIN song 
        ON playlist_song_activities.song_id = song.id 
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError(playlistActivitiesNotFound);
    }

    const activities = result.rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.time,
    }));
    return {
      playlistId,
      activities,
    };
  }

  async addActivities({ playlistId, songId, userId, action }) {
    const activitiesId = `playlist_song_activities-${nanoid(16)}`;
    const now = new Date();

    const query = {
      text: `INSERT INTO 
        playlist_song_activities(id, playlist_id, song_id, user_id, "action", time)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING id`,
      values: [activitiesId, playlistId, songId, userId, action, now],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError(addActivitiesFailed);
    }
    return result.rows[0].id;
  }
}

module.exports = PlaylistActivitiesService;
