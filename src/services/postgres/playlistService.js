const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/invariantError");
const NotFoundError = require("../../exceptions/notFoundError");
const AuthorizationError = require("../../exceptions/authorizationError");

const FailedAddPlaylist = "Gagal Menambahkan Playlist";
const DeletePlaylistByIdFailed = "Gagal Menghapus Playlist. Id tidak ditemukan";
const FailedAddSongInPlaylist = "Gagal Menambahkan Lagu di dalam Playlist";
const PlaylistNotFound = "PLaylist tidak ditemukan";
const NotAllowedOnThisResource = "Anda tidak berhak mengakses resource ini!";

class PlaylistService {
  constructor(songService, collaborationService) {
    this.pool = new Pool();
    this.songService = songService;
    this.collaborationService = collaborationService;
  }

  async addPlaylist(name, userId) {
    const playlistId = `playlist-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO 
        playlists(id, name, owner) 
      VALUES($1, $2, $3)
      RETURNING id`,
      values: [playlistId, name, userId],
    };
    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError(FailedAddPlaylist);
    }
    return result.rows[0].id;
  }

  async getPlaylist(userId) {
    const query = {
      text: `SELECT 
        playlists.id, 
        playlists.name, 
        users.username 
      FROM public.playlists 
      JOIN public.users 
        ON playlists.owner = users.id 
      LEFT JOIN public.collaborations 
        ON collaborations.playlist_id = playlists.id 
      WHERE 
        users.id = $1 
        OR collaborations.user_id = $1 
      GROUP BY playlists.id, users.username`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: `DELETE FROM playlists WHERE id = $1 RETURNING id`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0]?.id) {
      throw new NotFoundError(DeletePlaylistByIdFailed);
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    await this.songService.getSongById(songId);
    const playlistSongId = `playlist_songs-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO 
        playlist_songs(id, playlist_id, song_id) 
      VALUES($1, $2, $3)
      RETURNING id`,
      values: [playlistSongId, playlistId, songId],
    };
    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError(FailedAddSongInPlaylist);
    }

    return result.rows[0].id;
  }

  async deleteSongInPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM 
        playlist_songs 
      WHERE playlist_id =$1 
        AND song_id = $2
      RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await this.pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError(FailedAddSongInPlaylist);
    }
    return result.rows[0].id;
  }

  async getSongsInPlaylistById(playlistId) {
    const query = {
      text: `SELECT 
        playlists.id as "playlistId", 
        playlists.name,
        users.username,
        song.id, 
        song.title,
        song.performer
      FROM public.playlists 
      LEFT JOIN public.users
        ON playlists.owner = users.id
      LEFT JOIN public.playlist_songs 
        ON playlists.id = playlist_songs.playlist_id 
      LEFT JOIN public.song
        ON playlist_songs.song_id = song.id
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError(PlaylistNotFound);
    }
    const playlist = {
      id: result.rows[0].playlistId,
      name: result.rows[0].name,
      username: result.rows[0].username,
    };

    if (!result.rows[0]?.id) {
      return playlist;
    }
    const songs = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      performer: row.performer,
    }));
    return {
      ...playlist,
      songs,
    };
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: `SELECT owner FROM playlists WHERE id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError(PlaylistNotFound);
    }

    const ownerId = result.rows[0].owner;
    if (ownerId !== userId) {
      throw new AuthorizationError(NotAllowedOnThisResource);
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this.collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}
module.exports = PlaylistService;
