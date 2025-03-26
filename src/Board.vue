<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { type Round, key, type Score, isBolt, isBoltScore } from "./utils";
import Cell from "./Cell.vue";
import { computed } from "vue";

const playersCount = 2;

const rounds = useLocalStorage<Round[]>(key("rounds"), []);
const scores = useLocalStorage<string[]>(
	key("scores"),
	Array(playersCount).fill(""),
);
const textKeyboard = useLocalStorage<boolean>(key("textKeyboard"), false);
const inputMode = computed(() => (textKeyboard.value ? "text" : "numeric"));

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

	const newScores: Score[] = scores.value.map((score, index) => {
		const scoreIsBolt = isBolt(score);
		const lastRound = rounds.value[rounds.value.length - 1];
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

		const lastBoltScore = rounds.value
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

	rounds.value.push({
		id: rounds.value.length + 1,
		scores: newScores,
	});
	scores.value = Array(playersCount).fill("");
}

function removeRound(id: number | undefined) {
	if (rounds.value.length === 0) return;
	if (!confirm("Sigur?")) return;
	const index = rounds.value.findIndex((round) => round.id === id);
	rounds.value.splice(index, 1);
}

function resetGame() {
	if (!confirm("Sigur?")) return;
	rounds.value = [];
	scores.value = Array(playersCount).fill("");
}
</script>

<template>
	<div class="grid gap-4">
		<button type="button" @click="resetGame" class="btn">
			Resetează jocul
		</button>

		<div class="border-base-content/5 bg-base-100 rounded border">
			<table class="table text-center">
				<thead class="bg-base-200 text-xs">
					<tr>
						<th v-for="index in scores.length">#{{ index }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="rounds.length === 0">
						<td :colspan="scores.length" class="text-center">Fără runde</td>
					</tr>
					<tr v-for="round in rounds" :key="round.id" class="list-row">
						<td v-for="score in round.scores">
							<Cell :score="score" />
						</td>
					</tr>
				</tbody>
				<tfoot class="bg-base-200 text-xs">
					<tr>
						<th :colspan="scores.length">
							<div class="flex items-center justify-between">
								<div class="inline-flex divide-x">
									<span
										v-for="score in rounds[rounds.length - 1]?.scores"
										class="px-2"
									>
										{{ score.total }}
									</span>
								</div>

								<button
									type="button"
									@click="removeRound(rounds[rounds.length - 1]?.id)"
									class="btn btn-xs"
									:disabled="rounds.length === 0"
								>
									Șterge ultima rundă
								</button>
							</div>
						</th>
					</tr>
				</tfoot>
			</table>
		</div>

		<div class="flex items-center justify-between">
			<label class="inline-flex gap-1 text-xs">
				<input
					type="checkbox"
					v-model="textKeyboard"
					class="toggle toggle-xs"
				/>
				<kbd v-if="textKeyboard" class="kbd kbd-xs">ABC</kbd>
				<kbd v-else class="kbd kbd-xs">123</kbd>
			</label>
		</div>

		<form @submit.prevent="addScores" class="grid gap-4">
			<fieldset class="fieldset">
				<div class="join">
					<template v-for="(_, index) in scores">
						<input
							v-model="scores[index]"
							class="input join-item focus:z-10"
							:placeholder="`#${index + 1}`"
							:inputmode="inputMode"
						/>
					</template>
				</div>
				<p class="fieldset-label">
					<kbd class="kbd kbd-xs">b</kbd>
					<kbd class="kbd kbd-xs">bt</kbd>
					sau <kbd class="kbd kbd-xs">bolt</kbd> pentru bolt
				</p>
			</fieldset>

			<button type="submit" class="btn block w-full">Adaugă</button>
		</form>
	</div>
</template>
