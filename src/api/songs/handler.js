

class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postSongsHandler = this.postSongsHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongsByIdHandler = this.getSongsByIdHandler.bind(this);
    this.putSongsByIdHandler = this.putSongsByIdHandler.bind(this);
    this.deleteSongsByIdHandler = this.deleteSongsByIdHandler.bind(this);
  }

  async postSongsHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } =
      request.payload;
    const songId = await this.service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });
    return h
      .response({
        status: "success",
        data: {
          songId,
        },
      })
      .code(201);
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this.service.getSong({ title, performer });
    return h
      .response({
        status: "success",
        data: {
          songs,
        },
      })
      .code(200);
  }

  async getSongsByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this.service.getSongById(id);
    return h
      .response({
        status: "success",
        data: {
          song,
        },
      })
      .code(200);
  }

  async putSongsByIdHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const { title, year, genre, performer, duration, albumId } =
      request.payload;
    await this.service.editSongById(id, {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });
    return h
      .response({
        status: "success",
        message: `put songs by id ${id} success`,
      })
      .code(200);
  }

  async deleteSongsByIdHandler(request, h) {
    const { id } = request.params;
    await this.service.deleteSongById(id);
    return h
      .response({
        status: "success",
        message: `delete song by id ${id} success`,
      })
      .code(200);
  }
}
module.exports = SongsHandler;
