const express = require('express');
const DiscordRPC = require('discord-rpc');
const app = express();
const port = 7000;

// Configuration Discord RPC
const clientId = '1347329691610124358'; // Remplacez par votre Client ID Discord
DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

// Variables pour stocker les informations du film
let currentMovie = null;

// Connexion à Discord RPC
rpc.on('ready', () => {
  console.log('Discord Rich Presence connecté !');
  if (currentMovie) {
    setActivity(currentMovie);
  }
});

rpc.login({ clientId }).catch(console.error);

// Fonction pour mettre à jour la Rich Presence
function setActivity(movieTitle) {
  rpc.setActivity({
    details: `Regarde : ${movieTitle}`,
    state: 'Sur Stremio',
    startTimestamp: new Date(),
    largeImageKey: 'stremio_logo', // Remplacez par une image personnalisée si nécessaire
    largeImageText: 'Stremio',
    instance: false,
  });
}

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Endpoint pour le manifeste de l'addon
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.stremio.richpresence',
    version: '1.0.0',
    name: 'Rich Presence Addon',
    description: 'Affiche le film en cours de lecture sur Discord.',
    resources: ['stream'],
    types: ['movie'],
    catalogs: [],
    idPrefixes: ['tt'],
  });
});

// Endpoint pour gérer les requêtes de streaming
app.post('/stream', (req, res) => {
  const { body } = req;
  if (body && body.type === 'movie' && body.name) {
    currentMovie = body.name; // Mettre à jour le film en cours
    console.log(`Film détecté : ${currentMovie}`);

    // Mettre à jour la Rich Presence
    if (rpc && rpc.isConnected) {
      setActivity(currentMovie);
    }

    // Répondre à Stremio avec un flux fictif (ou réel si vous en avez un)
    res.json({
      streams: [
        {
          title: `Regarde : ${currentMovie}`,
          url: 'https://letterboxd.com/film/evil-does-not-exist/', // Remplacez par une URL de flux valide
        },
      ],
    });
  } else {
    res.status(400).json({ error: 'Requête invalide' });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Addon running on http://localhost:${port}`);
});