# AQ54 Backend

Serveur mettant à disposition une API Restful permettant de récupérer et de trier l'historique des mesures effectuées par les capteurs SMART188 et SMART199. Réalisé avec NestJS.

## Comment exécuter ?

Ce serveur est censée communiquer avec d'autres services et donc il est préférable de passer par [ce repository](https://github.com/Guymaster/aq54-start) qui simplifie la configuration et le lancement.

Si toutefois, vous voulez lancer uniquement cette application, vous pouvez suivre les étapes suivantes :

Commencez par cloner ce dépot en ouvrant un terminal pour y entrer la ligne suivante :

```
git clone https://github.com/Guymaster/aq54-backend.git
```

Ouvrez le nouveau dossier **aq54** et créez-y un fichier environnement nommé `.env`. Vous devez y renseigner les variables d'environnement de la manière suivante :

```
# API
NODE_ENV=prod
API_PORT=5000
API_VERSION=1.0.0

# DATABASE
DB_URL=<Url de la base de données>

# FIREBASE
FB_ACCOUNT_TYPE=<Type de compte Firebase>
FB_PROJECT_ID=<ID projet Firebase>
FB_PRIVATE_KEY_ID=<ID clé privée Firebase>
FB_PRIVATE_KEY=<Clé privée Firebase>
FB_CLIENT_EMAIL=<Email client Firebase>
FB_CLIENT_ID=<Id client Firebase>
FB_AUTH_URI=<Auth uri Firebase>
FB_TOKEN_URI=<Token uri Firebase>
FB_AUTH_PROVIDER_X509=<Auth provider Firebase>
FB_CLIENT_X509=<Client X509 Firebase>
FB_UNIVERSE_DOMAIN=<Uniiverse domain Firebase>
```

Vous avez dû recevoir ces informations par mail. Si ce n'est pas cas, veuillez me contacter.

Suivez l'une des étapes suivantes pour lancer l'appication.

### Lancer en mode développement

Ouvrez un terminal dans le repertoire aq54 et installez les dépendances en entrant :

```
npm install
```

```
npm run prisma-generate
```
```
npm run prisma-migrate
```

Enfin, entrez :

```
npm start
```

Accédez à la documentation Swagger via `localhost:5000/api-docs`
### Lancer en mode production (avec Docker)

Entrez successivement :

```
docker build -t aq54-backend .
```

```
docker run --name aq54-backend -p 5000:5000  aq54-backend
```

Accédez à la documentation Swagger via `localhost:5000/api-docs`