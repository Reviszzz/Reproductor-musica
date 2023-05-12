import React, { useState, useEffect } from "react";
// API de spotify
import SpotifyWebApi from "spotify-web-api-js";
// Estilos(Componentes)
import "./App.css";
import hImage from "./assets/img/img-home.avif";
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { CardActionArea } from "@mui/material";

// Fondo Oscuro
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const spotifyApi = new SpotifyWebApi();

const getTokenFromUrl = () => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

function App() {
  //Cada estado que le da funcionabilidad a la Api
  const [spotifyToken, setSpotifyToken] = useState("");
  const [nowPlaying, setNowPlaying] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    const spotifyToken = getTokenFromUrl().access_token;
    window.location.hash = "";

    if (spotifyToken) {
      setSpotifyToken(spotifyToken);
      spotifyApi.setAccessToken(spotifyToken);
      spotifyApi.getMe().then((user) => {
        spotifyApi.getUserPlaylists(user.id).then((playlists) => {
          setPlaylist(playlists.items);
        });
      });
      setLoggedIn(true);
      setInterval(() => {
        spotifyApi.getMyCurrentPlaybackState().then((response) => {
          setCurrentTime(response.progress_ms);
        });
      }, 1000);
    }
  }, []);

  //Funcion que permite ver el contendio de cada canción
  const getNowPlaying = () => {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      setNowPlaying({
        nameTrack: response.item.name,
        albumArt: response.item.album.images[0].url,
        nameArtists: response.item.artists[0].name,
        duration: response.item.duration_ms,
      });
      setCurrentTime(response.progress_ms);
      setDuration(response.item.duration_ms);
    });
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = async (response) => {
    response.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await spotifyApi.search(searchQuery, [
        "album",
        "artist",
        "track",
      ]);
      console.log(response);
      if (
        !response ||
        !response.artists ||
        response.artists.items.length === 0 
      ) {
        setSearchResult(null);
      } else {
        const artist = response.artists.items[0];
        const image = artist.images[0].url;
        const name = artist.name;
       const songs = artist.top_tracks
          ? artist.top_tracks.map((track) => track.name)
          : [];
        setSearchResult({
          image,
          name,
          songs,
        });
        console.log(songs)
      }
    } catch (error) {
      console.error(error);
      setSearchResult(null);
    }
  };

  //Un effect que permite renovar el contendio de los metodos
  useEffect(() => {
    if (loggedIn) {
      spotifyApi.getMyCurrentPlaybackState().then((response) => {
        if (response && response.item) {
          setNowPlaying({
            nameTrack: response.item.name,
            albumArt: response.item.album.images[0].url,
            nameArtists: response.item.artists[0].name,
            duration: response.item.duration_ms,
          });
          setCurrentTime(response.progress_ms);
          setDuration(response.item.duration_ms);
        } else {
          setNowPlaying({});
          setCurrentTime(0);
        }
      });
    }
  }, [nowPlaying, loggedIn]);

  // Funcion para medir en tiempo real la duracion de la canción
  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  // Funcion para subir y bajar volumen
  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    spotifyApi.setVolume(newVolume * 100).then(() => {
      console.log(`Volume set to ${newVolume}`);
    });
  };

  // Funcion para adelantar la cancion y devolver a la anterior
  const togglePlay = () => {
    if (!isPlaying) {
      spotifyApi.pause();
    } else {
      spotifyApi.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <div>
        {!loggedIn && (
          /*para ingresar a la Api*/
          <div className="home-container">
            <div className="home-left-child">
              <h1>
                <i class="fab fa-spotify"></i>
                <span>Spotify</span>
              </h1>
              <h3>Bienvenido de nuevo</h3>
              <h6>Identificate para encontrar tu música favorita</h6>
              <button
                onClick={() => (window.location.href = "http://localhost:8888")}
              >
                Siguiente
              </button>
            </div>
            <div
              className="home-right-child"
              style={{ backgroundImage: `url(${hImage})` }}
            />
          </div>
        )}
        {loggedIn && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <Box sx={{ padding: 5, justifyContent: "center" }}>
                <TextField
                  label="Buscar canción, artista o álbum"
                  variant="outlined"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  sx={{ width: 400, mr: 2 }}
                />
                <Button
                  sx={{ alignItems: "center" }}
                  variant="contained"
                  onClick={handleSearchSubmit}
                >
                  Buscar
                </Button>
              </Box>
              {searchResult && (
              <Card sx={{ maxWidth: 345, margin: "auto" }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image={searchResult.image}
                    alt={searchResult.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {searchResult.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchResult.songs.map((song) => (
                        <li key={song}>{song}</li>
                      ))}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            )}

              <Card sx={{ display: "flex", alignItems: "center" }}>
                <ThemeProvider theme={darkTheme}>
                  <Card sx={{ display: "flex", justifyContent: "center" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: 2,
                      }}
                    >
                      <CardContent sx={{ flex: "1 0 auto" }}>
                        <Typography component="div" variant="h5">
                          {nowPlaying.nameTrack}
                        </Typography>
                        <Typography variant="subtitle1" component="div">
                          {nowPlaying.nameArtists}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="subtitle1"
                          component="h2"
                        >
                          {millisToMinutesAndSeconds(currentTime)} /{" "}
                          {millisToMinutesAndSeconds(duration)}
                        </Typography>
                      </CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          pl: 1,
                          pb: 1,
                        }}
                      >
                        <IconButton aria-label="previous">
                          {theme.direction === "rtl" ? (
                            <SkipNextIcon />
                          ) : (
                            <SkipPreviousIcon
                              onClick={() => {
                                spotifyApi.skipToPrevious(), getNowPlaying();
                              }}
                            />
                          )}
                        </IconButton>
                        <IconButton aria-label="play/pause">
                          <PlayArrowIcon
                            sx={{ height: 38, width: 38 }}
                            onClick={() => togglePlay()}
                          />
                        </IconButton>
                        <IconButton aria-label="next">
                          {theme.direction === "rtl" ? (
                            <SkipPreviousIcon />
                          ) : (
                            <SkipNextIcon
                              onClick={() => {
                                spotifyApi.skipToNext(), getNowPlaying();
                              }}
                            />
                          )}
                        </IconButton>
                      </Box>
                      <Stack
                        spacing={2}
                        direction="row"
                        sx={{ mb: 1 }}
                        alignItems="center"
                      >
                        <VolumeDown />
                        <input
                          className="input-volumen"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={handleVolumeChange}
                        />
                        <VolumeUp />
                      </Stack>
                    </Box>

                    <CardMedia
                      component="img"
                      sx={{ width: 240 }}
                      image={nowPlaying.albumArt}
                      alt="Live from space album cover"
                    />
                  </Card>
                </ThemeProvider>
              </Card>
            </Box>
          </>
        )}
      </div>
    </>
  );
}

export default App;
