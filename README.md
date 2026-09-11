# Suivi de campagne JDR

Application Vue.js (Vue Router + Pinia) pour préparer et suivre des campagnes de jeu de rôle. Aucun backend : les données sont stockées dans le navigateur (localStorage).

## Membres du groupe

- Mahery Gonin
- Abdourahmane Coulibaly
- Morgan Lucas
- Lorenzo Porretti

## Installation et lancement

```sh
npm install
npm run dev
```

Build de production :

```sh
npm run build
```

## Fonctionnalités bonus

- Génération aléatoire d'objets et de lieux (bouton d'aide à la création dans le formulaire de contenus de l'interface MJ).

## Mode d'emploi

Un bouton en haut de page permet de passer entre l'espace MJ et l'espace joueur.

### Côté MJ

- **Campagnes** : la liste de toutes tes campagnes. En ouvrir une donne accès à sa fiche (nom, état, description) et à ses chapitres — chaque chapitre a lui-même sa page pour gérer ses quêtes. C'est aussi ici qu'on voit les joueurs rattachés à la campagne.
- **Joueurs** : pour créer et gérer les personnages, leur inventaire, et les relier à une campagne.
- **Lieux / objets / indices** : la bibliothèque de contenus réutilisable, à piocher ensuite dans les chapitres et les quêtes.

### Côté joueur

- **Suivi de partie** : où en est la campagne (chapitres et quêtes en cours ou terminés).
- **Mon inventaire** : les objets et indices récupérés.
- **Actions** : se déplacer, puis activer ou terminer un chapitre ou une quête avec le mot de passe donné par le MJ.
