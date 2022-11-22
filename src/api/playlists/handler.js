class PlaylistsHandler {
  constructor(playlistService, validator, activitiesService) {
    this.playlistService = playlistService;
    this.validator = validator;
    this.activitiesService = activitiesService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistByIdHandler =
      this.postSongToPlaylistByIdHandler.bind(this);
    this.getSongsInPlaylistByIdHandler =
      this.getSongsInPlaylistByIdHandler.bind(this);
    this.deleteSongsInPlaylistByIdHandler =
      this.deleteSongsInPlaylistByIdHandler.bind(this);
    this.getPlaylistActivitiesByIdHandler =
      this.getPlaylistActivitiesByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this.playlistService.addPlaylist(
      name,
      credentialId
    );

    return h
      .response({
        status: "success",
        data: {
          playlistId,
        },
      })
      .code(201);
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.playlistService.getPlaylist(credentialId);

    return h
      .response({
        status: "success",
        data: {
          playlists,
        },
      })
      .code(200);
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

    await this.playlistService.deletePlaylistById(playlistId);

    return h
      .response({
        status: "success",
        message: "playlist telah dihapus",
      })
      .code(200);
  }

  async postSongToPlaylistByIdHandler(request, h) {
    this.validator.validatePostsSongInPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    await this.playlistService.addSongToPlaylist(playlistId, songId);

    await this.activitiesService.addActivities({
      playlistId,
      songId,
      userId: credentialId,
      action: "add",
    });

    return h
      .response({
        status: "success",
        message: "lagu telah ditambahkan",
      })
      .code(201);
  }

  async getSongsInPlaylistByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this.playlistService.getSongsInPlaylistById(
      playlistId
    );

    return h
      .response({
        status: "success",
        data: {
          playlist,
        },
      })
      .code(200);
  }

  async deleteSongsInPlaylistByIdHandler(request, h) {
    this.validator.validateDeleteSongInPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    await this.playlistService.deleteSongInPlaylist(playlistId, songId);

    await this.activitiesService.addActivities({
      playlistId,
      songId,
      userId: credentialId,
      action: "delete",
    });

    return h
      .response({
        status: "success",
        message: "delete song in playlist success",
      })
      .code(200);
  }

  async getPlaylistActivitiesByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this.playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const data = await this.activitiesService.getActivities(playlistId);

    return h.response({
      status: "success",
      data,
    });
  }
}

module.exports = PlaylistsHandler;
