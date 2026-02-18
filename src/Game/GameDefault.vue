<script setup lang="ts">
import {
	type Score,
	isBolt,
	isBoltScore,
	id,
	type Game,
	type Team,
	type Player,
} from "../utils";
import Cell from "./Cell.vue";
import { computed, ref, toRef } from "vue";
import { RouterLink } from "vue-router";
import Keyboard from "./Keyboard.vue";

const props = defineProps<{ game: Game }>();
const game = toRef(props, "game");
const lastRound = computed(
	() => game.value.rounds[game.value.rounds.length - 1],
);
const scores = ref<string[]>(Array(game.value.teams.length).fill(""));

const nextToDealCards = computed(() => {
	const roundsCount = game.value.rounds.length;
	const teamsCount = game.value.teams.length;

	const teamIndex = roundsCount % teamsCount;
	const team = game.value.teams[teamIndex] as Team;

	const playerIndex =
		Math.floor(roundsCount / teamsCount) % team.players.length;
	const player = team.players[playerIndex] as Player;

	return {
		team,
		player,
	};
});

function addScores() {
	const boltCount = scores.value.filter(isBolt).length;

	if (boltCount > 1) {
		alert("Prea multe bolturi");
		return;
	}

	const invalidScores = scores.value.filter(
		(s) => !isBolt(s) && Number.isNaN(Number(s)),
	).length;

	if (invalidScores > 0) {
		alert("Scoruri invalide");
		return;
	}

	// TODO: Separate each score type calculation in separate functions
	const newScores = scores.value.map<Score>((score, index) => {
		const scoreIsBolt = isBolt(score);
		const lastRound = game.value.rounds[game.value.rounds.length - 1];
		// @ts-expect-error - we know it's not undefined
		const lastRoundTotal = lastRound ? lastRound.scores[index].total : 0;

		if (!scoreIsBolt) {
			const value = Number(scores.value[index] || "0");
			return {
				type: "normal",
				total: lastRoundTotal + value,
				delta: value,
			};
		}

		const lastBoltScore = game.value.rounds
			// @ts-expect-error - we know it's not undefined
			.findLast((round) => isBoltScore(round.scores[index]))
			?.scores.find(isBoltScore);

		if (!lastBoltScore || lastBoltScore.delta === 3) {
			return {
				type: "bolt",
				total: lastRoundTotal,
				delta: 1,
			};
		}

		if (lastBoltScore.delta === 1) {
			return {
				type: "bolt",
				total: lastRoundTotal,
				delta: 2,
			};
		}

		if (lastBoltScore.delta === 2) {
			return {
				type: "bolt",
				total: lastRoundTotal - 10,
				delta: 3,
			};
		}

		alert("Invalid bolt score");
		throw new Error("Invalid bolt score");
	});

	game.value.rounds = [
		...game.value.rounds,
		{
			id: id(),
			scores: newScores,
		},
	];

	scores.value = Array(game.value.teams.length).fill("");
}

function removeRound(id: string | undefined) {
	if (game.value.rounds.length === 0) return;
	if (!confirm("Sigur?")) return;
	game.value.rounds = game.value.rounds.filter((round) => round.id !== id);
}

function resetGame() {
	if (!confirm("Sigur?")) return;
	game.value.rounds = [];
	scores.value = Array(game.value.teams.length).fill("");
}

const focusedPlayer = ref<number>(0);

function handleAdd() {
	if (scores.value.some((score) => score === "")) {
		alert("Toți jucătorii trebuie să aibă un scor");
		return;
	}

	addScores();
	scores.value = Array(game.value.teams.length).fill("");
	focusedPlayer.value = 0;
	document.scrollingElement?.scrollTo({
		top: document.scrollingElement.scrollHeight,
		behavior: "smooth",
	});
}

function handleNext() {
	if (focusedPlayer.value === undefined) return;
	const nextPlayer = (focusedPlayer.value + 1) % game.value.teams.length;
	focusedPlayer.value = nextPlayer;
}

function handleBack() {
	if (focusedPlayer.value === undefined) return;
	const previousPlayer =
		(focusedPlayer.value - 1 + game.value.teams.length) %
		game.value.teams.length;
	focusedPlayer.value = previousPlayer;
}

function handleClear() {
	if (focusedPlayer.value === undefined) return;
	scores.value[focusedPlayer.value] = "";
}

function handleBolt() {
	scores.value[focusedPlayer.value] = "Bolt";
	handleNext();
}

function handleMinus() {
	if (focusedPlayer.value === undefined) return;
	scores.value[focusedPlayer.value] = "-10";
	handleNext();
}

function handleNumber(value: number) {
	if (focusedPlayer.value === undefined) return;

	let score = scores.value[focusedPlayer.value] || "";

	if (isBolt(score) || score === "-10" || score[0] === "0") {
		score = "";
	}

	if (value === 0 && score === "") {
		return;
	}

	const newValue = score + value;

	if (newValue.length > 2) {
		alert("Scor prea mare");
		return;
	}

	scores.value[focusedPlayer.value] = newValue;
}
</script>

<template>
	<div class="grid gap-4">
		<div class="join flex">
			<RouterLink to="/" class="btn join-item"> Înapoi </RouterLink>
			<button type="button" @click="resetGame" class="btn join-item grow">
				Resetează jocul
			</button>
		</div>

		<div class="border-base-content/5 bg-base-100 rounded border">
			<table class="table table-fixed text-center">
				<thead class="bg-base-200 text-xs">
					<tr>
						<th v-for="team in game.teams" class="truncate px-2">
							{{ team.name }}
						</th>
						<!-- Keeps last column 0 width -->
						<th class="w-0 p-0"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="game.rounds.length === 0">
						<td :colspan="scores.length" class="text-center">
							Fără runde
						</td>
					</tr>
					<tr
						v-for="(round, roundIndex) in game.rounds"
						:key="round.id"
						class="list-row"
					>
						<td
							v-for="score in round.scores"
							class="px-0"
							:class="{
								'border-b-primary border-b':
									roundIndex !== game.rounds.length - 1 &&
									(roundIndex + 1) %
										game.totalPlayersCount ===
										0,
							}"
						>
							<Cell
								:score="score"
								:bold="roundIndex === game.rounds.length - 1"
							/>
						</td>
						<td
							v-if="roundIndex === game.rounds.length - 1"
							class="relative w-0 p-0"
						>
							<div
								class="absolute inset-y-0 right-0 content-center px-2"
							>
								<button
									type="button"
									@click="removeRound(lastRound?.id)"
									class="btn btn-xs btn-ghost"
									:disabled="game.rounds.length === 0"
								>
									&times;
								</button>
							</div>
						</td>
					</tr>
				</tbody>

				<tfoot class="bg-base-200 text-xs">
					<tr>
						<th
							v-for="(team, index) in game.teams"
							class="px-2 py-1"
							:class="{
								'outline-2': focusedPlayer === index,
							}"
						>
							<div class="truncate">{{ team.name }}</div>
							<div>{{ scores[index] || "n/a" }}</div>
						</th>
					</tr>
				</tfoot>
			</table>
		</div>

		<div class="text-xs font-semibold">
			<span class="text-base-content/50">Bate Cărțile: </span>
			<span class="italic">
				<span>{{ nextToDealCards.team.name }}</span>
				<span v-if="game.totalPlayersCount / game.teams.length !== 1">
					- {{ nextToDealCards.player.name }}
				</span>
			</span>
		</div>

		<Keyboard
			@add="handleAdd"
			@next="handleNext"
			@back="handleBack"
			@clear="handleClear"
			@bolt="handleBolt"
			@minus="handleMinus"
			@number="handleNumber"
		/>
	</div>
</template>
