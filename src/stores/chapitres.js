import { defineStore } from "pinia";
import { computed, ref } from "vue";
import useLocaleStorage from "../composables/useLocaleStorage.js";

// Constante de stockage
export const CLE_STOCKAGE = "jdr.chapitres.v1";

const useChapitresStore = defineStore("chapitres", () => {
	// States
	const liste = ref([]);
	// Persistance : lectureImpossible est un state.
	// enregistrer est une action de sauvegarde.
	const { lectureImpossible, enregistrer } = useLocaleStorage(CLE_STOCKAGE, liste);

	// Getters
	const parId = computed(() => (id) => liste.value.find((element) => element.id === id) ?? null);
	const parCampagne = computed(
		() => (campagneId) => liste.value.filter((chapitre) => chapitre.campagneId === campagneId),
	);

	// Actions (setters)
	function ajouter(element) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const nouveau = { ...JSON.parse(JSON.stringify(element)), id: crypto.randomUUID() };
		liste.value.push(nouveau);
		return nouveau.id;
	}

	function modifier(id, changements) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const index = liste.value.findIndex((element) => element.id === id);
		if (index === -1) throw new Error("Élément introuvable.");
		liste.value.splice(index, 1, { ...liste.value[index], ...JSON.parse(JSON.stringify(changements)), id });
	}

	function supprimer(id) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const index = liste.value.findIndex((element) => element.id === id);
		if (index === -1) throw new Error("Élément introuvable.");
		liste.value.splice(index, 1);
	}

	function dupliquer(id) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const original = liste.value.find((chapitre) => chapitre.id === id);
		if (!original) throw new Error("Élément introuvable.");
		const copie = {
			...JSON.parse(JSON.stringify(original)),
			id: crypto.randomUUID(),
			nom: `${original.nom} (copie)`,
			quetes: (original.quetes ?? []).map((quete) => ({ ...quete, id: crypto.randomUUID() })),
			recompensesDistribuees: false,
		};
		liste.value.push(copie);
		return copie.id;
	}

	function supprimerParCampagne(campagneId) {
		liste.value = liste.value.filter((chapitre) => chapitre.campagneId !== campagneId);
	}

	function deplacer(campagneId, chapitreId, direction) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const positions = liste.value
			.map((chapitre, index) => chapitre.campagneId === campagneId ? index : null)
			.filter((index) => index !== null);
		const position = positions.indexOf(liste.value.findIndex((chapitre) => chapitre.id === chapitreId));
		const cible = position + direction;
		if (![-1, 1].includes(direction) || position < 0 || cible < 0 || cible >= positions.length) return;
		const index = positions[position];
		const indexCible = positions[cible];
		[liste.value[index], liste.value[indexCible]] = [liste.value[indexCible], liste.value[index]];
	}

	return {
		liste,
		parId,
		parCampagne,
		ajouter,
		modifier,
		supprimer,
		dupliquer,
		supprimerParCampagne,
		deplacer,
		lectureImpossible,
		enregistrer,
	};
});

export default useChapitresStore;
