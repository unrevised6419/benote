<script setup lang="ts">
import {
	type Score,
	isBolt,
	type Game,
	type Team,
	type Player,
	wrap,
} from "../utils";
import Cell from "./Cell.vue";
import { computed, nextTick, onMounted, ref, toRef, useTemplateRef } from "vue";
import { RouterLink } from "vue-router";
import Keyboard from "./Keyboard.vue";
import { zip } from "es-toolkit";

const props = defineProps<{ game: Game }>();
const game = toRef(props, "game");
const inputScores = ref<Array<string | undefined>>([]);
const focusedPlayer = ref<number>(0);
const teamsCount = computed(() => game.value.teams.length);

const scrollContainerRef = useTemplateRef("scrollContainer");

const nextToDealCards = computed(() => {
	const roundsCount = game.value.rounds.length;

	const teamIndex = roundsCount % teamsCount.value;
	const team = game.value.teams[teamIndex] as Team;

	const playerIndex =
		Math.floor(roundsCount / teamsCount.value) % team.players.length;
	const player = team.players[playerIndex] as Player;

	return { team, player };
});

function addScores() {
	const boltCount = inputScores.value.filter(isBolt).length;

	if (boltCount > 1) {
		alert("Prea multe bolturi");
		return;
	}

	const invalidScores = inputScores.value.filter(
		(s) => !isBolt(s) && Number.isNaN(Number(s)),
	).length;

	if (invalidScores > 0) {
		alert("Scoruri invalide");
		return;
	}

	const lastRoundScores =
		game.value.rounds[game.value.rounds.length - 1]?.scores ?? [];

	const zippedScores = zip<Score | undefined, string | undefined>(
		lastRoundScores,
		inputScores.value,
	);

	const roundScores = zippedScores.map<Score>(([lastScore, inputScore]) => {
		const lastRoundTotal = lastScore?.total ?? 0;
		const lastRoundBoltCount = wrap(lastScore?.boltCount ?? 0, 0, 3);

		if (isBolt(inputScore)) {
			const delta = lastRoundBoltCount === 2 ? -10 : 0;

			return {
				type: "bolt",
				total: lastRoundTotal + delta,
				delta,
				boltCount: lastRoundBoltCount + 1,
			};
		}

		const value = Number(inputScore || "0");

		return {
			type: "normal",
			total: lastRoundTotal + value,
			delta: value,
			boltCount: lastRoundBoltCount,
		};
	});

	game.value.rounds = [
		...game.value.rounds,
		{
			scores: roundScores,
		},
	];

	inputScores.value = [];
}

function removeLastRound() {
	if (!confirm("Sigur?")) return;
	game.value.rounds = game.value.rounds.slice(0, -1);
}

function resetGame() {
	if (!confirm("Sigur?")) return;
	game.value.rounds = [];
	inputScores.value = [];
}

function handleAdd() {
	if (
		inputScores.value.some((score) => score === undefined || score === "")
	) {
		alert("Toți jucătorii trebuie să aibă un scor");
		return;
	}

	addScores();
	inputScores.value = [];
	nextTick(navigateToEnd);
}

function handleNext() {
	const nextPlayer = (focusedPlayer.value + 1) % game.value.teams.length;
	focusedPlayer.value = nextPlayer;
}

function handleBack() {
	const previousPlayer =
		(focusedPlayer.value - 1 + game.value.teams.length) %
		game.value.teams.length;
	focusedPlayer.value = previousPlayer;
}

function handleClear() {
	inputScores.value[focusedPlayer.value] = undefined;
}

function handleBolt() {
	inputScores.value[focusedPlayer.value] = "Bolt";
	handleNext();
}

function handleMinus() {
	inputScores.value[focusedPlayer.value] = "-10";
	handleNext();
}

function handleNumber(value: number) {
	let score = inputScores.value[focusedPlayer.value] || "";

	if (isBolt(score) || score === "-10" || score[0] === "0") {
		score = "";
	}

	const newValue = score + value;

	if (newValue.length > 2) {
		alert("Scor prea mare");
		return;
	}

	inputScores.value[focusedPlayer.value] = newValue;
}

onMounted(navigateToEnd);

function navigateToEnd() {
	if (!scrollContainerRef.value) return;

	scrollContainerRef.value.scrollTo({
		top: scrollContainerRef.value.scrollHeight,
		behavior: "smooth",
	});
}
</script>

<template>
	<div class="relative flex h-dvh flex-col">
		<div
			ref="scrollContainer"
			class="grid gap-4 overflow-scroll overscroll-contain p-4"
		>
			<div class="join flex">
				<RouterLink to="/" class="btn join-item"> Înapoi </RouterLink>
				<button
					type="button"
					@click="resetGame"
					class="btn join-item grow"
				>
					Resetează jocul
				</button>
			</div>

			<div class="border-base-content/5 bg-base-100 rounded border">
				<table class="table table-fixed text-center">
					<thead class="bg-base-200 text-xs">
						<tr>
							<th
								v-for="team in game.teams"
								class="truncate px-2"
							>
								{{ team.name }}
							</th>
							<!-- Keeps last column 0 width -->
							<th class="w-0 p-0"></th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="game.rounds.length === 0">
							<td :colspan="teamsCount" class="text-center">
								Fără runde
							</td>
						</tr>
						<tr
							v-for="(round, roundIndex) in game.rounds"
							:key="roundIndex"
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
									:bold="
										roundIndex === game.rounds.length - 1
									"
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
										@click="removeLastRound"
										class="btn btn-xs btn-ghost"
										:disabled="game.rounds.length === 0"
									>
										&times;
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div
				:style="{
					'--teams': `repeat(${game.teams.length}, minmax(0, 1fr))`,
				}"
				class="bg-base-200 grid grid-cols-(--teams) gap-1.5 text-xs"
			>
				<button
					v-for="(team, index) in game.teams"
					class="btn"
					:class="{ 'outline-2': focusedPlayer === index }"
					@click="focusedPlayer = index"
				>
					<div class="leading-4">
						<div class="truncate">{{ team.name }}</div>
						<div>{{ inputScores[index] || "n/a" }}</div>
					</div>
				</button>
			</div>

			<div class="text-xs font-semibold">
				<span class="text-base-content/50">Bate Cărțile: </span>
				<span class="italic">
					<span>{{ nextToDealCards.team.name }}</span>
					<span
						v-if="game.totalPlayersCount / game.teams.length !== 1"
					>
						- {{ nextToDealCards.player.name }}
					</span>
				</span>
			</div>
		</div>

		<div class="mt-auto">
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
	</div>
</template>
