class CollaborationsHandler {
  constructor(collaborationsService, playlistService, userService, validator) {
    this.collaborationsService = collaborationsService;
    this.playlistService = playlistService;
    this.userService = userService;
    this.validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler =
      this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this.userService.getUserById(userId);

    const collaborationId = await this.collaborationsService.addCollaborator(
      playlistId,
      userId
    );

    return h
      .response({
        status: "success",
        message: "Kolaborasi berhasil ditambahkan",
        data: {
          collaborationId,
        },
      })
      .code(201);
  }

  async deleteCollaborationHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this.collaborationsService.deleteCollaborator(playlistId, userId);

    return h
      .response({
        status: "success",
        message: "Kolaborasi berhasil dihapus",
      })
      .code(200);
  }
}
module.exports = CollaborationsHandler;
