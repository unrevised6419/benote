<script setup lang="ts">
import { formatter, isBoltScore, type Score } from "../utils";

defineProps<{
	score: Score;
	bold: boolean;
}>();
</script>

<template>
	<div class="flex items-center justify-center gap-1">
		<template v-if="isBoltScore(score)">
			<span :class="{ 'font-bold': bold }">{{ score.total }}</span>
			<span v-if="score.delta !== 3" class="badge badge-warning badge-xs">
				&times;{{ score.delta }}
			</span>
			<span v-else class="badge badge-error badge-xs">-10</span>
		</template>
		<template v-else>
			<span :class="{ 'font-bold': bold }">{{ score.total }}</span>
			<span
				class="badge badge-xs"
				:class="{
					'badge-ghost': score.delta !== -10,
					'badge-warning': score.delta === -10,
				}"
			>
				{{ formatter.format(score.delta) }}
			</span>
		</template>
	</div>
</template>
