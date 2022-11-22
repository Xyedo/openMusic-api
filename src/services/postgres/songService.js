const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/invariantError");
const NotFoundError = require("../../exceptions/notFoundError");

const addSongFailed = "Lagu gagal ditambahkan";
const songNotFound = "Lagu tidak ditemukan";
const updateSongByIdFailed = `Lagu gagal ditambahkan, ${songNotFound}`;
const deleteSongByIdFailed = `Lagu gagal dihapus, ${songNotFound}`;

class SongService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    const songId = `song-${nanoid(16)}`;
    const createdAt = new Date();

    const query = {
      text: `INSERT INTO 
      song(
        id,
        title,
        year,
        genre,
        performer,
        created_at,
        updated_at, 
        duration, 
        album_id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id`,
      values: [
        songId,
        title,
        year,
        genre,
        performer,
        createdAt,
        createdAt,
        duration,
        albumId,
      ],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw new InvariantError(addSongFailed);
    }
    return result.rows[0].id;
  }

  async getSong(reqQuery) {
    let { title = undefined, performer = undefined } = reqQuery;
    let query;
    if (title !== undefined && performer !== undefined) {
      title = `%${title}%`;
      performer = `%${performer}%`;
      query = {
        text: `SELECT 
          id, title, performer 
        FROM public.song 
        WHERE 
          title ILIKE $1 
          AND performer ILIKE $2`,
        values: [title, performer],
      };
    } else if (title !== undefined) {
      title = `%${title}%`;
      query = {
        text: `SELECT 
          id, title, performer 
        FROM public.song 
        WHERE 
          title ILIKE $1`,
        values: [title],
      };
    } else if (performer !== undefined) {
      performer = `%${performer}%`;
      query = {
        text: `SELECT 
          id, title, performer 
        FROM public.song 
        WHERE 
          performer ILIKE $1`,
        values: [performer],
      };
    } else {
      query = {
        text: `SELECT id, title, performer FROM public.song`,
      };
    }

    const { rows } = await this.pool.query(query);
    return rows;
  }

  async getSongById(id) {
    const cacheId = `song-${id}`;
    try {
      const ret = await this.cacheService.get(cacheId);
      return JSON.parse(ret);
    } catch (_error) {
      const query = {
        text: `SELECT 
            id, 
            title, 
            year, 
            performer, 
            genre, 
            duration, 
            album_id as "albumId" 
          FROM public.song 
          WHERE id = $1`,
        values: [id],
      };
      const result = await this.pool.query(query);
      if (result.rowCount === 0) {
        throw new NotFoundError(songNotFound);
      }
      const ret = result.rows[0];
      await this.cacheService.set(cacheId, JSON.stringify(ret));
      return ret;
    }
  }

  async editSongById(
    id,
    { title, year, genre, performer, duration = null, albumId = null }
  ) {
    const updatedAt = new Date();

    const query = {
      text: `UPDATE song 
      SET 
        title=$1,
        year=$2, 
        genre=$3, 
        performer=$4, 
        duration=$5, 
        album_id=$6, 
        updated_at=$7 
      WHERE id = $8
      RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw new NotFoundError(updateSongByIdFailed);
    }
    await this.cacheService.delete(`song-${id}`);
    return result.rows[0].id;
  }

  async deleteSongById(id) {
    const query = {
      text: `DELETE FROM song where id= $1 RETURNING id`,
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw new NotFoundError(deleteSongByIdFailed);
    }
    await this.cacheService.delete(`song-${id}`);
  }
}

module.exports = SongService;
