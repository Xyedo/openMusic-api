const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/invariantError");
const NotFoundError = require("../../exceptions/notFoundError");

const createAlbumFailed = "Album gagal ditambahkan";
const albumNotFound = "Album tidak ditemukan";
const EditAlbumByIdFailed = "Gagal memperbarui album, id tidak ditemukan";
const DeleteAlbumByIdFailed = "album gagal dihapus. Id tidak ditemukan";
const likesAlbumFailed = "Album gagal di likes";
const unlikesAlbumFailed = "Album gagal di unlikes";

class AlbumService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const albumId = `album-${nanoid(16)}`;
    const createdAt = new Date();

    const query = {
      text: `INSERT INTO 
      album(id, name, year, created_at, updated_at) 
      VALUES($1, $2, $3, $4, $5) RETURNING id`,
      values: [albumId, name, year, createdAt, createdAt],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw new InvariantError(createAlbumFailed);
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const cacheId = `album-${id}`;
    try {
      const ret = await this.cacheService.get(cacheId);
      return JSON.parse(ret);
    } catch (_error) {
      const query = {
        text: `SELECT 
          album.id as album_id, album.name, album.year, album.cover,
          song.id as song_id, song.title, song.performer
        FROM public.album 
        LEFT JOIN public.song 
        ON album.id = song.album_id 
        WHERE album.id = $1`,
        values: [id],
      };

      const result = await this.pool.query(query);
      if (!result.rows[0]?.album_id) {
        throw new NotFoundError(albumNotFound);
      }
      const album = {
        id: result.rows[0].album_id,
        name: result.rows[0].name,
        year: result.rows[0].year,
        coverUrl: result.rows[0].cover,
      };
      if (!result.rows[0]?.song_id) {
        return album;
      }
      const songs = result.rows.map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      }));

      const ret = {
        ...album,
        songs,
      };
      await this.cacheService.set(cacheId, JSON.stringify(ret));
      return ret;
    }
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date();

    const query = {
      text: `UPDATE album SET name=$1, year=$2, updated_at=$3 WHERE id= $4 RETURNING id`,
      values: [name, year, updatedAt, id],
    };

    const result = await this.pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError(EditAlbumByIdFailed);
    }
    this.cacheService.delete(`album-${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: `DELETE FROM album where id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw new NotFoundError(DeleteAlbumByIdFailed);
    }
    this.cacheService.delete(`album-${id}`);
  }

  async addCoverByAlbumId(albumId, url) {
    const updatedAt = new Date();
    const query = {
      text: `UPDATE album SET cover=$1, updated_at=$2 WHERE id=$3 RETURNING id`,
      values: [url, updatedAt, albumId],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError(EditAlbumByIdFailed);
    }
  }

  async likeOrUnlikeAlbumById(albumId, userId) {
    const checkLikesQuery = {
      text: `SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };
    const result = await this.pool.query(checkLikesQuery);
    let isLike = false;
    if (!result.rows[0]?.id) {
      await this.getAlbumById(albumId);

      const albumLikeId = `album-likes-${nanoid(16)}`;
      const queryLike = {
        text: `INSERT INTO 
        user_album_likes(id, user_id, album_id) 
        VALUES($1, $2, $3) RETURNING id`,
        values: [albumLikeId, userId, albumId],
      };
      const insertResult = await this.pool.query(queryLike);
      if (insertResult.rowCount === 0) {
        throw new InvariantError(likesAlbumFailed);
      }

      isLike = true;
    } else {
      const { id: albumLikesId } = result.rows[0];
      const queryUnlike = {
        text: `DELETE FROM user_album_likes WHERE id = $1 RETURNING id`,
        values: [albumLikesId],
      };
      const unlikeResult = await this.pool.query(queryUnlike);
      if (unlikeResult.rowCount === 0) {
        throw new InvariantError(unlikesAlbumFailed);
      }
      isLike = false;
    }

    this.cacheService.delete(`album-likes:${albumId}`);
    return isLike;
  }

  async getTotalLikes(albumId) {
    const cacheId = `album-likes:${albumId}`;
    try {
      const result = await this.cacheService.get(cacheId);
      return { isCache: true, totalLikes: parseInt(result, 10) };
    } catch (_error) {
      const query = {
        text: `SELECT COUNT(id) AS "totalLikes" FROM user_album_likes WHERE album_id = $1`,
        values: [albumId],
      };

      const result = await this.pool.query(query);
      if (result.rowCount === 0) {
        throw NotFoundError(albumNotFound);
      }
      const { totalLikes } = result.rows[0];
      await this.cacheService.set(cacheId, totalLikes);
      return { isCache: false, totalLikes: parseInt(totalLikes, 10) };
    }
  }
}

module.exports = AlbumService;
