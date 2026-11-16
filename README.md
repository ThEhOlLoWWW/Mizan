# Mizan — Bijouterie Al Andalous (Nador)

Mizan est une application web de lecture qui affiche en un seul écran le cours de l'or et de l'argent, en dirhams (ou en dollars / euros), avec un estimateur de bijou pour le comptoir.

Pas de compte, pas de base de données, aucune donnée personnelle : c'est une vitrine de lecture, pas un système de caisse.

- **Démo** : _à compléter (lien GitHub Pages)_
- **Auteur** : _à compléter_

## Utilisateurs visés

| Utilisateur         | Besoin                                                      | Réponse de l'application                            |
| ------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Hassan, le patron   | Voir l'or et l'argent du jour en dirhams, avec la variation | Cartes de prix + sélecteur de devise                |
| Salma, au comptoir  | Estimer un bijou à partir de son poids                      | Estimateur de bijou                                 |
| Youssef, l'apprenti | Vérifier la dernière mise à jour, repérer une panne         | Horodatage de l'API, bandeau d'état, journal réseau |

## Lancer le projet

Le projet utilise des modules ES : il doit être servi par un serveur HTTP, l'ouverture directe du fichier (`file://`) ne fonctionne pas.

1. Cloner le dépôt.
2. Ouvrir le dossier dans VS Code et lancer **Live Server** sur `index.html` (par exemple `http://127.0.0.1:5500`).

Aucune clé d'API et aucune installation ne sont nécessaires.

## API utilisée : xaus.com

Base : `https://xaus.com/api/v1`. L'API est gratuite, sans authentification. Limite annoncée : 60 requêtes par minute sur `/spot`.

### `GET /spot`

| Paramètre  | Type               | Défaut | Utilisation dans Mizan                                         |
| ---------- | ------------------ | ------ | -------------------------------------------------------------- |
| `currency` | code ISO 4217      | `USD`  | `MAD`, `USD` ou `EUR` selon le sélecteur                       |
| `unit`     | `oz`, `gram`, `kg` | `oz`   | non utilisé (le prix est converti en grammes côté application) |

Exemple : `https://xaus.com/api/v1/spot?currency=MAD`

Champs de la réponse utilisés :

| Champ           | Rôle                                                             |
| --------------- | ---------------------------------------------------------------- |
| `xau.price`     | prix de l'or par once troy, dans la devise demandée              |
| `xau.currency`  | devise de la réponse                                             |
| `silver_usd_oz` | prix de l'argent par once, **toujours en USD**                   |
| `fx_rate`       | taux USD vers devise demandée                                    |
| `updated_at`    | horodatage de la dernière mise à jour (affiché dans l'en-tête)   |
| `stale`         | vrai si les données ne sont pas à jour (bandeau d'avertissement) |

### `GET /history`

Aucun paramètre n'est documenté. La réponse contient environ 1 258 points journaliers `{ d, c, h, l }` (date, clôture, plus haut, plus bas), triés du plus ancien au plus récent.

Constats vérifiés pendant le développement :

- l'historique ne contient que **l'or en USD** ; le paramètre `currency` est ignoré (la réponse indique toujours `USD`) ;
- il n'y a pas de données d'historique pour l'argent ;
- seuls les jours de cotation sont présents (pas de week-end).

Mizan n'utilise que les **deux derniers points** pour calculer la variation de l'or.

### Exemples de réponses

Le dossier `samples/` contient une réponse réelle de chaque endpoint (`spot.json`, `history.json`), enregistrées le 16/11/2026, pour pouvoir tester hors-ligne. Ces réponses ne contiennent que des cours de marché, aucune donnée personnelle : il n'y a rien à anonymiser. Les valeurs sont un instantané et diffèrent des cours affichés plus tard.

## Fonctionnalités et état d'avancement

| Story | Contenu                                                                | État                                                      |
| ----- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| US-01 | Connexion à l'API, prix, devise, horodatage de l'API                   | Fait                                                      |
| US-02 | Cartes générées dynamiquement, variation avec flèche et couleur        | Fait (variation indisponible pour l'argent, voir limites) |
| US-03 | Choix de la devise (MAD, USD, EUR), nouvelle requête, devise mémorisée | Fait                                                      |
| US-04 | Historique 7 / 30 jours avec mini-graphique                            | **Non réalisé**                                           |
| US-05 | Estimateur de bijou, fonction pure, saisies invalides refusées         | Fait                                                      |
| US-06 | États chargement / succès / erreur, erreurs distinguées, « Réessayer » | Fait                                                      |
| US-07 | Journal des requêtes (bonus)                                           | Fait                                                      |

### Détail

- **Cartes** : l'API ne renvoie pas de tableau de métaux. Un adaptateur (`buildSpotData` dans `api.js`) transforme la réponse en tableau `metals`, et les cartes sont générées à partir de ce tableau : le nombre de cartes découle des données, pas du HTML. Le prix par gramme est calculé à partir du prix par once (1 once troy = 31,1034768 g).
- **Argent** : l'API ne donne le prix qu'en USD. Le prix dans la devise choisie est `silver_usd_oz × fx_rate`.
- **Variation de l'or** : `(dernière clôture − clôture précédente) / clôture précédente × 100`, calculée avec `calculateChangePct` à partir des deux derniers points de `/history`. C'est une variation entre deux clôtures journalières, pas une variation glissante sur 24 h. Le week-end, elle reste celle du vendredi. La valeur en dirhams par gramme est reconstituée à partir de ce pourcentage.
- **Devise mémorisée** : le choix est enregistré dans `localStorage` et relu au chargement. Valeur par défaut : MAD.
- **Estimateur** : valeur = poids × prix du gramme × pureté, arrondie à 2 décimales. Il utilise le dernier prix chargé (aucune requête supplémentaire) et suit la devise choisie. Les puretés proposées dépendent du métal (or 18 carats et 24 carats, argent 925). Un poids vide, négatif ou nul affiche un message sous le champ.
- **Journal réseau** : panneau repliable listant les 20 dernières requêtes (méthode, URL, statut, durée en ms). Un panneau vide ne casse rien.

## Choix techniques

- **JavaScript vanilla en modules ES**, sans framework ni librairie.
- **Séparation des responsabilités** :

```
index.html
css/style.css
js/
  config.js       constantes (URL de l'API, devises, noms des métaux)
  api.js          appels réseau, journal des requêtes, classification des erreurs, adaptateur de réponse
  calculator.js   fonctions pures (validation, conversion once/gramme, valeur du bijou, variation en %)
  ui.js           tout ce qui touche au DOM
  main.js         orchestration : chargement, événements, états
  chart.js        réservé au graphique (non implémenté)
samples/          réponses réelles de l'API
```

- **Pas de `innerHTML`** : toute donnée venue du réseau est insérée avec `textContent` ou `createElement`.
- **Un seul point d'entrée pour charger les prix** : la fonction `loadPrices` de `main.js` gère le chargement, le succès et l'erreur. Le chargement initial, le bouton « Actualiser », « Réessayer » et le changement de devise l'appellent tous, donc ils se comportent de la même façon.
- **États visibles** : au chargement, un bandeau et des cartes « squelette » ; en cas de succès, un bandeau vert (ou orange si l'API signale des données périmées) ; en cas d'erreur, un bandeau rouge avec le bouton « Réessayer ». Les éléments marqués `data-busy` sont désactivés pendant une requête pour éviter les appels en double.
- **Erreurs distinguées** (`classifyError`) : hors-ligne, quota dépassé (429), erreur de requête (4xx), erreur serveur (5xx), réponse JSON illisible, délai dépassé, erreur réseau.
- **Délai maximal de 10 secondes** par requête (`AbortSignal.timeout`) : l'interface ne reste jamais bloquée sur « chargement ».
- **Respect du quota** : aucun rafraîchissement automatique. Les prix sont chargés au démarrage, sur clic de « Actualiser » et au changement de devise.
- **Langues** : identifiants de code en anglais, textes d'interface en français.

## Difficultés rencontrées et solutions

| Difficulté                                                                               | Solution                                                                                                            |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| L'API ne renvoie pas une liste de métaux mais un bloc `xau` et un nombre `silver_usd_oz` | Adaptateur `buildSpotData` qui construit le tableau `metals` ; les cartes en découlent                              |
| L'argent n'est donné qu'en USD                                                           | Conversion avec `fx_rate`                                                                                           |
| `/spot` ne contient aucune variation                                                     | Calcul à partir des deux derniers points de `/history` ; pour l'argent, la carte affiche « Variation indisponible » |
| `/history` ignore la devise et ne couvre que l'or                                        | Limite documentée ; la variation de l'or est calculée en pourcentage, indépendamment de la devise                   |
| Les identifiants du JavaScript ne correspondaient pas à ceux du HTML                     | Alignement des identifiants et des noms de classes entre `ui.js`, `index.html` et `style.css`                       |
| Le test hors-ligne affichait « succès »                                                  | Le navigateur répondait depuis son cache : le test se fait avec « Disable Cache » coché dans l'onglet Réseau        |
| Une requête sans réponse pouvait laisser l'interface en chargement                       | Délai maximal de 10 secondes, avec un message d'erreur dédié                                                        |
| Le formulaire de l'estimateur rechargeait la page avec la touche Entrée                  | `preventDefault()` sur l'événement `submit`                                                                         |
| On pouvait choisir « Or » avec la pureté « Argent 925 »                                  | Les puretés incompatibles avec le métal choisi sont désactivées                                                     |

## Tests effectués

Tests manuels :

- chargement réel des prix, puis changement de devise (MAD, EUR, USD) : nouvelle requête et mise à jour des cartes ;
- rechargement de la page : la devise choisie est conservée ;
- estimateur : calcul, changement de métal, poids vide ou négatif (message sous le champ, pas de rechargement avec Entrée), changement de devise ;
- état d'erreur : réseau coupé dans l'onglet Réseau des DevTools (cache désactivé), message affiché, puis « Réessayer » ;
- journal réseau : ajout des requêtes, compteur, bouton « Effacer ».

## Limites connues

- **US-04 (historique avec graphique) n'est pas réalisée.** Le panneau « Historique des cours » de la page est un emplacement vide. Le module `api.js` sait déjà récupérer les N derniers jours (`fetchPriceHistory`), et `calculator.js` contient le calcul de variation, mais le graphique n'est pas construit.
- L'historique de l'API est limité à l'or en USD.
- La variation affichée est une variation entre deux clôtures journalières (voir plus haut), et elle n'existe pas pour l'argent.
- Il n'y a pas de délai d'attente imposé sur le bouton « Actualiser » : seuls les appels simultanés sont empêchés.
- Les listes de devises et de métaux de l'estimateur sont écrites dans le HTML.
- Les estimations de l'estimateur sont **indicatives** (prix du marché, hors frais de la bijouterie).
