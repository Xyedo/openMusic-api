require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const globalError = require("./utils/globalError");
const TokenManager = require("./tokenize/tokenManager");

const album = require("./api/album");
const AlbumService = require("./services/postgres/albumService");
const AlbumValidator = require("./validator/album");
const StorageService = require("./services/S3/storageService");

const songs = require("./api/songs");
const SongService = require("./services/postgres/songService");
const SongValidator = require("./validator/song");

const users = require("./api/users");
const UserService = require("./services/postgres/userService");
const UserValidator = require("./validator/users");

const authentications = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/authenticationService");
const AuthenticationsValidator = require("./validator/authentications");

const playlists = require("./api/playlists");
const PlaylistService = require("./services/postgres/playlistService");
const PlaylistsValidator = require("./validator/playlists");
const PlaylistActivitiesService = require("./services/postgres/playlistActivitiesService");

const collaborations = require("./api/collaborations");
const CollaborationService = require("./services/postgres/collaborationsService");
const CollaborationsValidator = require("./validator/collaborations");

const exportsApi = require("./api/exports");
const ExportsService = require("./services/rabbitmq/producerService");
const ExportsValidator = require("./validator/exports");

const CacheService = require("./services/redis/cacheService");

const init = async () => {
  const cacheService = new CacheService();
  const albumService = new AlbumService(cacheService);
  const songsService = new SongService(cacheService);
  const userService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(
    songsService,
    collaborationService
  );
  const playlistActivitiesService = new PlaylistActivitiesService();
  const storageService = new StorageService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });
  await server.register([
    {
      plugin: Jwt,
    },
  ]);
  server.auth.strategy("playlists_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: async (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });
  await server.register([
    {
      plugin: album,
      options: {
        albumService,
        uploadService: storageService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService: userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistService,
        validator: PlaylistsValidator,
        playlistActivitiesService,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService: collaborationService,
        playlistService,
        userService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exportsApi,
      options: {
        exportService: ExportsService,
        playlistService,
        validator: ExportsValidator,
      },
    },
  ]);
  server.ext("onPreResponse", globalError);
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`); // eslint-disable-line no-console
};

init();
