class AlbumHandler {
  constructor(albumService, uploadService, validator) {
    this.albumService = albumService;
    this.uploadService = uploadService;
    this.validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverByIdhandler = this.postAlbumCoverByIdhandler.bind(this);
    this.postAlbumLikesByIdhandler = this.postAlbumLikesByIdhandler.bind(this);
    this.getAlbumLikesByIdhandler = this.getAlbumLikesByIdhandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this.albumService.addAlbum({ name, year });

    return h
      .response({
        status: "success",
        data: {
          albumId,
        },
      })
      .code(201);
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this.albumService.getAlbumById(id);

    return h
      .response({
        status: "success",
        data: {
          album,
        },
      })
      .code(200);
  }

  async putAlbumByIdHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this.albumService.editAlbumById(id, {
      name,
      year,
    });

    return h
      .response({
        status: "success",
        message: `album edited by id ${id}`,
      })
      .code(200);
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this.albumService.deleteAlbumById(id);

    return h
      .response({
        status: "success",
        message: `album by id ${id} successfully deleted`,
      })
      .code(200);
  }

  async postAlbumCoverByIdhandler(request, h) {
    const { cover } = request.payload;
    this.validator.validateAlbumCoverHeaders(cover.hapi.headers);
    const { id: albumId } = request.params;
    const fileLocation = await this.uploadService.writeFile(cover, cover.hapi);

    await this.albumService.addCoverByAlbumId(albumId, fileLocation);

    return h
      .response({
        status: "success",
        message: "Sampul berhasil diunggah",
      })
      .code(201);
  }

  async postAlbumLikesByIdhandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const isLike = await this.albumService.likeOrUnlikeAlbumById(
      albumId,
      credentialId
    );
    return h
      .response({
        status: "success",
        message: `album berhasil ${isLike ? "disukai" : "tidak disukai"}`,
      })
      .code(201);
  }

  async getAlbumLikesByIdhandler(request, h) {
    const { id: albumId } = request.params;
    const { isCache, totalLikes: likes } =
      await this.albumService.getTotalLikes(albumId);

    const resp = h
      .response({
        status: "success",
        data: {
          likes,
        },
      })
      .code(200);
    if (isCache) {
      resp.header("X-Data-Source", "cache");
    }
    return resp;
  }
}

module.exports = AlbumHandler;
