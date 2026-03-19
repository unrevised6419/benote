<script setup lang="ts">
import {
	type Score,
	type Game,
	type Team,
	type Player,
	wrap,
	formatDuration,
} from "../utils";
import Cell from "./Cell.vue";
import {
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	ref,
	toRef,
	useTemplateRef,
} from "vue";
import { RouterLink } from "vue-router";
import Keyboard from "./Keyboard.vue";
import { isNumber, sum, zip } from "es-toolkit";

type InputScore = "bolt" | "minus" | "hang" | number;

const props = defineProps<{ game: Game }>();
const game = toRef(props, "game");
const inputScores = ref<Array<InputScore | undefined>>([]);
const focusedPlayer = ref<number>(0);
const teamsCount = computed(() => game.value.teams.length);
const showRoundInfo = ref<Record<number, boolean>>({});

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

function timeFromBeginning() {
	const createdDate = new Date(game.value.createdDate);
	return formatDuration(new Date().getTime() - createdDate.getTime());
}

const durationFromBeginning = ref(timeFromBeginning());

let interval: number;
onMounted(() => {
	interval = setInterval(() => {
		durationFromBeginning.value = timeFromBeginning();
	}, 1000);
});

onUnmounted(() => {
	clearInterval(interval);
});

function handleAdd() {
	let invalid = false;

	const scores = Array.from(
		{ length: game.value.teams.length },
		(_, i) => inputScores.value[i] ?? 0,
	);

	const bolts = scores.filter((i) => i === "bolt");
	const hangs = scores.filter((i) => i === "hang");

	// There cannot be multiple bolts
	if (bolts.length > 1) invalid = true;
	// There cannot be multiple hangs
	if (hangs.length > 1) invalid = true;
	// There cannot be a bolt and a hang in the same round
	if (bolts.length > 0 && hangs.length > 0) invalid = true;

	const numberScores = scores.filter(isNumber);
	const maxNumberScore = Math.max(...numberScores, 0);
	const maxNumberScores = scores.filter((s) => s === maxNumberScore);
	const maxNumberScoreIndex =
		maxNumberScores.length > 1
			? focusedPlayer.value
			: scores.indexOf(maxNumberScore);

	if (maxNumberScoreIndex === -1) invalid = true;

	if (invalid) {
		alert("Scoruri invalide");
		return;
	}

	const lastRound = game.value.rounds.at(-1);
	const lastRoundScores = lastRound?.scores ?? [];
	const lastHangTotal = lastRound?.hangTotal ?? 0;
	const isHangRound = hangs.length > 0;

	const zippedScores = zip<Score | undefined, InputScore | undefined>(
		lastRoundScores,
		scores,
	);

	const roundScores = zippedScores.map<Score>(
		([lastScore, inputScore], inputScoreIndex) => {
			const lastRoundTotal = lastScore?.total ?? 0;
			const lastRoundBoltCount = wrap(lastScore?.boltCount ?? 0, 0, 3);

			if (inputScore === "bolt") {
				const delta = lastRoundBoltCount === 2 ? -10 : 0;

				return {
					type: "bolt",
					total: lastRoundTotal + delta,
					delta,
					boltCount: lastRoundBoltCount + 1,
				};
			}

			if (inputScore === "hang") {
				return {
					type: "hang",
					total: lastRoundTotal,
					delta: maxNumberScore,
					boltCount: lastRoundBoltCount,
				};
			}

			if (inputScore === "minus") {
				return {
					type: "normal",
					total: lastRoundTotal - 10,
					delta: -10,
					boltCount: lastRoundBoltCount,
				};
			}

			const value = Number(inputScore || "0");

			if (isHangRound) {
				return {
					type: "normal",
					total: lastRoundTotal + value,
					delta: value,
					boltCount: lastRoundBoltCount,
				};
			}

			if (inputScoreIndex !== maxNumberScoreIndex) {
				return {
					type: "normal",
					total: lastRoundTotal + value,
					delta: value,
					boltCount: lastRoundBoltCount,
				};
			}

			return {
				type: lastHangTotal > 0 ? "hang-win" : "normal",
				total: lastRoundTotal + value + lastHangTotal,
				delta: value + lastHangTotal,
				boltCount: lastRoundBoltCount,
			};
		},
	);

	const previousCreatedDate =
		lastRound?.createdDate ?? game.value.createdDate;

	game.value.rounds = [
		...game.value.rounds,
		{
			scores: roundScores,
			roundTotal: sum(scores.filter(isNumber).filter((n) => n > 0)),
			hangTotal: isHangRound ? lastHangTotal + maxNumberScore : 0,
			createdDate: new Date().toISOString(),
			duration:
				new Date().getTime() - new Date(previousCreatedDate).getTime(),
		},
	];

	inputScores.value = [];
	focusedPlayer.value = 0;

	nextTick(navigateToEnd);
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

function handleClear() {
	const score = inputScores.value[focusedPlayer.value];
	inputScores.value[focusedPlayer.value] =
		typeof score === "number" ? Math.floor(score / 10) : undefined;
}

function handleBolt() {
	inputScores.value[focusedPlayer.value] = "bolt";
}

function handleMinus() {
	inputScores.value[focusedPlayer.value] = "minus";
}

function handleHang() {
	inputScores.value[focusedPlayer.value] = "hang";
}

function handleNumber(value: number) {
	const inputScore = inputScores.value[focusedPlayer.value];
	const score = typeof inputScore === "number" ? inputScore : 0;
	const newValue = score * 10 + value;

	if (newValue > 99) {
		alert("Scor prea mare");
		return;
	}

	inputScores.value[focusedPlayer.value] = newValue;
}

function handleNext() {
	focusedPlayer.value = wrap(focusedPlayer.value + 1, 0, teamsCount.value);
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
							<th v-for="team in game.teams" class="truncate">
								{{ team.name }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="game.rounds.length === 0">
							<td :colspan="teamsCount" class="">Fără runde</td>
						</tr>
						<tr
							v-for="(round, roundIndex) in game.rounds"
							:key="roundIndex"
							class="cursor-pointer"
							@click="
								showRoundInfo[roundIndex] =
									!showRoundInfo[roundIndex]
							"
						>
							<template v-if="showRoundInfo[roundIndex]">
								<td
									:colspan="teamsCount"
									class="py-0"
									:class="{
										'border-b-primary border-b':
											roundIndex !==
												game.rounds.length - 1 &&
											(roundIndex + 1) %
												game.totalPlayersCount ===
												0,
									}"
								>
									<div
										class="flex cursor-pointer justify-center py-3"
									>
										<div>Total: {{ round.roundTotal }}</div>
										<div
											class="divider divider-horizontal mx-0"
										/>
										<div>
											Duration:
											{{ formatDuration(round.duration) }}
										</div>
									</div>
								</td>
							</template>
							<template v-else>
								<td
									v-for="score in round.scores"
									:class="{
										'border-b-primary border-b':
											roundIndex !==
												game.rounds.length - 1 &&
											(roundIndex + 1) %
												game.totalPlayersCount ===
												0,
									}"
								>
									<Cell
										:score="score"
										:bold="
											roundIndex ===
											game.rounds.length - 1
										"
									/>
								</td>
							</template>
						</tr>
					</tbody>
				</table>
			</div>

			<div
				:style="{
					'--teams': `repeat(${teamsCount}, minmax(0, 1fr))`,
				}"
				class="grid grid-cols-(--teams) gap-1.5 text-xs"
			>
				<button
					v-for="(team, index) in game.teams"
					class="btn"
					:class="{ 'outline-2': focusedPlayer === index }"
					@click="focusedPlayer = index"
				>
					<div class="leading-4">
						<div class="truncate">{{ team.name }}</div>
						<div
							v-if="inputScores[index] !== undefined"
							class="text-base-content/60"
						>
							<template v-if="inputScores[index] === 'bolt'">
								Bolt
							</template>
							<template
								v-else-if="inputScores[index] === 'minus'"
							>
								-10
							</template>
							<template v-else-if="inputScores[index] === 'hang'">
								Ouă
							</template>
							<template v-else>
								{{ inputScores[index] }}
							</template>
						</div>
						<div v-else class="text-base-content/60">n/a</div>
					</div>
				</button>
			</div>

			<div class="flex items-center justify-between gap-4">
				<div class="text-xs font-semibold">
					<span class="text-base-content/50">Bate Cărțile: </span>
					<span class="italic">
						<span>{{ nextToDealCards.team.name }}</span>
						<span v-if="game.totalPlayersCount / teamsCount !== 1">
							- {{ nextToDealCards.player.name }}
						</span>
					</span>
				</div>
				<span class="ml-auto text-xs">
					{{ durationFromBeginning }}
				</span>
				<button
					type="button"
					@click="removeLastRound"
					class="btn btn-xs"
					:disabled="game.rounds.length === 0"
				>
					Șterge ultima rundă
				</button>
			</div>
		</div>

		<div class="mt-auto">
			<Keyboard
				@hang="handleHang"
				@clear="handleClear"
				@bolt="handleBolt"
				@minus="handleMinus"
				@number="handleNumber"
				@add="handleAdd"
				@next="handleNext"
			/>
		</div>
	</div>
</template>
