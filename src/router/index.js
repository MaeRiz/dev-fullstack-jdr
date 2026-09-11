import ErrorNotFountView from "@/views/ErrorNotFountView.vue";
import ActionsView from "@/views/joueur/ActionsView.vue";
import InventaireView from "@/views/joueur/InventaireView.vue";
import JoueurLayout from "@/layout/JoueurLayout.vue";
import ProgressionView from "@/views/joueur/ProgressionView.vue";
import BibliothequeContenusView from "@/views/mj/BibliothequeContenusView.vue";
import EditionCampagneView from "@/views/mj/EditionCampagneView.vue";
import EditionChapitreView from "@/views/mj/EditionChapitreView.vue";
import EditionQueteView from "@/views/mj/EditionQueteView.vue";
import ListeCampagnesView from "@/views/mj/ListeCampagnesView.vue";
import ListeJoueursView from "@/views/mj/ListeJoueursView.vue";
import MjLayout from "@/layout/MjLayout.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{ path: "/", redirect: "/mj" },

	// Routes Maitre du jeu
	{
		path: "/mj",
		component: MjLayout,
		meta: { mode: "mj" },
		children: [
			{
				path: "",
				name: "mj-liste-campagnes",
				component: ListeCampagnesView,
			},
			{
				path: "campagnes/edition",
				name: "mj-edition-campagne",
				component: EditionCampagneView,
			},
			{
				path: "campagnes/:campagneId",
				name: "mj-gestion-campagne",
				component: EditionCampagneView,
			},
			{
				path: "chapitres/edition",
				name: "mj-edition-chapitre",
				component: EditionChapitreView,
			},
			{
				path: "quetes/edition",
				name: "mj-edition-quete",
				component: EditionQueteView,
			},
			{
				path: "joueurs",
				name: "mj-liste-joueurs",
				component: ListeJoueursView,
			},
			{
				path: "contenus",
				name: "mj-bibliotheque-contenus",
				component: BibliothequeContenusView,
			},
		],
	},

	// Route des joueurs
	{
		path: "/joueur",
		component: JoueurLayout,
		meta: { mode: "joueur" },
		children: [
			{
				path: "",
				name: "joueur-progression",
				component: ProgressionView,
			},
			{
				path: "inventaire",
				name: "joueur-inventaire",
				component: InventaireView,
			},
			{
				path: "actions",
				name: "joueur-actions",
				component: ActionsView,
			},
		],
	},

	// Page introuvable
	{ path: "/:pathMatch(.*)*", name: "erreur-page-introuvable", component: ErrorNotFountView },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
