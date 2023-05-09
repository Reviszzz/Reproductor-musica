const CLIENT_ID = 'ed7f1a3155194c0598e353d74225079d';
const CLIENT_SECRET = 'eef218b7a0a249809ab4eef8603290f2'; 
const REDIRECT_URI = 'http://localhost:8888/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-state',
  'user-modify-playback-state'
];

const form = document.querySelector('form');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  authenticate(email, password);
});

function authenticate(email, password) {
  const authHeader = btoa(CLIENT_ID + ':' + CLIENT_SECRET);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authHeader
    },
    body: new URLSearchParams({
      grant_type: 'password',
      redirect_uri: REDIRECT_URI,
      username: email,
      password: password,
      scope: SCOPES.join(' ')
    })
  };

  const accessToken = localStorage.getItem('access_token'); // Obtener el token de acceso del almacenamiento local

  fetch('https://accounts.spotify.com/api/token', requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const access_token = data.access_token;
      const token_type = data.token_type;
      const expires_in = data.expires_in;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('token_type', token_type);
      localStorage.setItem('expires_in', expires_in);
      window.location.href = 'http://localhost:5173';
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
