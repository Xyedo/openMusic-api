class ExportsHandler {
  constructor(exportService, playlistService, validator) {
    this.exportService = exportService;
    this.playlistService = playlistService;
    this.validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this.validator.validatorExportPlaylistPayload(request.payload);
    const { targetEmail } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this.playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this.exportService.sendMessage(
      `export:playlist`,
      JSON.stringify(message)
    );

    return h
      .response({
        status: "success",
        message: "Permintaan Anda sedang kami proses",
      })
      .code(201);
  }
}

module.exports = ExportsHandler;
