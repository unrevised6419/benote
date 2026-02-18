<script setup lang="ts">
import { shallowRef } from "vue";
import { id, key, type Game, type Team } from "./utils";
import { useLocalStorage } from "@vueuse/core";
import { useRouter, RouterLink } from "vue-router";
import { UserIcon, UserGroupIcon } from "@heroicons/vue/24/outline";

interface Choice {
	readonly label: string;
	readonly totalPlayers: number;
	readonly teams: number;
}

const router = useRouter();
const gamesRecord = useLocalStorage<Record<string, Game>>(key("games"), {});

const choices: [Choice, Choice, Choice, Choice] = [
	{ teams: 2, totalPlayers: 4, label: "2 x 2" },
	{ teams: 2, totalPlayers: 2, label: "1 x 1" },
	{ teams: 3, totalPlayers: 3, label: "1 x 1 x 1" },
	{ teams: 4, totalPlayers: 4, label: "1 x 1 x 1 x 1" },
];

const selectedChoice = shallowRef<Choice>(choices[0]);

const teams = shallowRef<ReadonlyArray<Team>>(
	createTeams(selectedChoice.value),
);

function createTeams(option: Choice): ReadonlyArray<Team> {
	const playersPerTeam = option.totalPlayers / option.teams;

	const teams = Array.from({ length: option.teams }, (_, i) => ({
		name: ``,
		players: Array.from({ length: playersPerTeam }, (_, j) => ({
			name: `P${i * playersPerTeam + j + 1}`,
		})),
	}));

	if (option.totalPlayers / option.teams !== 1) {
		// Pre-fill team names for 2x2 games
		if (teams[0]) teams[0].name = "Noi";
		if (teams[1]) teams[1].name = "Voi";
	}

	return teams;
}

function addTeams(option: Choice) {
	teams.value = createTeams(option);
}

function deleteGamesAfter50thGame(gamesRecord: Record<string, Game>) {
	const games = Object.values(gamesRecord);
	const sortedGames = games.toSorted(
		(a, b) =>
			new Date(b.createdDate).getTime() -
			new Date(a.createdDate).getTime(),
	);

	const gamesAfter50thGame = sortedGames.slice(24);
	gamesAfter50thGame.forEach((game) => delete gamesRecord[game.id]);
}

function createGame() {
	deleteGamesAfter50thGame(gamesRecord.value);

	const newGameId = id();

	gamesRecord.value[newGameId] = {
		id: newGameId,
		title: `Joc #${newGameId}`,
		createdDate: new Date().toISOString(),
		teams: teams.value,
		totalPlayersCount: selectedChoice.value.totalPlayers,
		rounds: [],
	};

	router.push(`/${newGameId}`);
}
</script>

<template>
	<div class="grid gap-4">
		<div class="join">
			<input
				v-for="choice in choices"
				@click="addTeams(choice)"
				:value="choice"
				class="join-item btn grow"
				type="radio"
				name="choice"
				:aria-label="choice.label"
				v-model="selectedChoice"
			/>
		</div>

		<form class="grid gap-4" @submit.prevent="createGame">
			<div v-for="(team, index) in teams" class="grid gap-2">
				<label class="input validator w-full">
					<UserGroupIcon class="h-[1em] opacity-50" />
					<input
						type="text"
						v-model="team.name"
						required
						:placeholder="`Nume Echipă ${index + 1}`"
						minlength="2"
						maxlength="20"
					/>
				</label>

				<div
					v-if="teams.length === team.players.length"
					class="ml-2 grid gap-2"
				>
					<div
						v-for="(player, playerIndex) in team.players"
						class="flex items-center gap-2"
					>
						<label class="input validator w-full">
							<UserIcon class="h-[1em] opacity-50" />
							<input
								type="text"
								v-model="player.name"
								:required="teams.length === team.players.length"
								:placeholder="`Nume Jucător ${playerIndex + 1}`"
								minlength="2"
								maxlength="20"
							/>
						</label>
					</div>
				</div>
			</div>

			<div class="join flex">
				<RouterLink to="/" class="btn join-item">Înapoi</RouterLink>
				<button
					type="submit"
					:disabled="!selectedChoice"
					class="btn join-item grow"
				>
					Crează
				</button>
			</div>
		</form>
	</div>
</template>
