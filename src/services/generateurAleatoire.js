export const DONNEES_OBJETS = {
  types: [
    "Épée",
    "Dague",
    "Bouclier",
    "Amulette",
    "Anneau",
    "Grimoire",
    "Potion",
    "Bâton",
    "Relique",
    "Fiole",
  ],
  adjectifs: [
    "ancienne",
    "scintillante",
    "des ombres",
    "runique",
    "rouillée",
    "enchantée",
    "oubliée",
    "éthérée",
    "du dragon",
    "solaire",
  ],
  descriptions: [
    "Une aura étrange s’en dégage lorsqu’on s’en approche.",
    "Forgé dans un métal inconnu, froid au toucher.",
    "Porte des inscriptions gravées dans un dialecte ancien.",
    "Légèrement usé par le temps mais toujours d’une rare efficacité.",
    "Scintille d’un éclat mystérieux dans l’obscurité.",
  ],
  commentairesMj: [
    "Perd ses pouvoirs magiques à la lumière directe du soleil.",
    "Lié à une quête secrète d’un ancien ordre de mages.",
    "Maudit : rend son porteur légèrement paranoïaque.",
    "Permet de débloquer le mécanisme d’une porte secrète.",
    "Objet de grande valeur convoité par les voleurs locaux.",
  ],
};

export const DONNEES_LIEUX = {
  types: [
    "Auberge",
    "Grotte",
    "Ruines",
    "Sanctuaire",
    "Crypte",
    "Manoir",
    "Tour",
    "Clairière",
    "Donjon",
    "Forteresse",
  ],
  adjectifs: [
    "abandonnée",
    "brumeuse",
    "oubliée",
    "secrète",
    "hantée",
    "millénaire",
    "des murmures",
    "sombre",
    "scintillante",
    "perdue",
  ],
  descriptions: [
    "L’air y est lourd et chargé d’une odeur de mousse et de poussière.",
    "Un silence pesant règne ici, à peine troublé par le vent.",
    "Les murs sont recouverts d’étranges fresques à demi effacées.",
    "Un endroit autrefois grandiose, désormais envahi par la végétation.",
    "La lumière y pénètre difficilement à travers d’étroites ouvertures.",
  ],
  commentairesMj: [
    "Un passage secret est dissimulé derrière le mur nord.",
    "Zone surveillée par des créatures hostiles cachées dans les hauteurs.",
    "Nécessite de résoudre une énigme pour en ressortir.",
    "Contient un coffre piégé avec une aiguille empoisonnée.",
    "Le lieu réagit étrangement à la présence d’artefacts magiques.",
  ],
};

const randomize = (object, type) => {
  const randomItems = (array) =>
    array[Math.floor(Math.random() * array.length)];

  const randomType = randomItems(object.types);
  const randomAdjecitif = randomItems(object.adjectifs);
  const randomDescription = randomItems(object.descriptions);
  const randomCommentaire = randomItems(object.commentairesMj);

  return {
    type,
    nom: randomType + " " + randomAdjecitif,
    description: randomDescription,
    commentaire: randomCommentaire,
  };
};

export const randomObjet = () => randomize(DONNEES_OBJETS, "objet");
export const randomLieu = () => randomize(DONNEES_LIEUX, "lieu");
