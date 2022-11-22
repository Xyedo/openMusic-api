const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/invariantError");

const FailedAddCollaborator = "Gagal Menambahkan Playlist";
const CollaborationNotFound =
  "Gagal Menghapus Collaboration, kombinasi playlistId dan UserId tidak ditemukan";
class CollaborationService {
  constructor() {
    this.pool = new Pool();
  }

  async addCollaborator(playlistId, userId) {
    const collaborationsId = `collaborations-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO 
        collaborations(id, playlist_id, user_id)
      VALUES($1,$2,$3)
      RETURNING id`,
      values: [collaborationsId, playlistId, userId],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw InvariantError(FailedAddCollaborator);
    }
    return result.rows[0].id;
  }

  async deleteCollaborator(playlistId, userId) {
    const query = {
      text: `DELETE FROM collaborations WHERE playlist_id = $1 AND user_id= $2 RETURNING id`,
      values: [playlistId, userId],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw InvariantError(CollaborationNotFound);
    }
    return result.rows[0].id;
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: `SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id= $2`,
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError("Kolaborasi gagal diverifikasi");
    }
  }
}
module.exports = CollaborationService;
