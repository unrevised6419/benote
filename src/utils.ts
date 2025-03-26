export type ScoreNormal = {
	type: "normal";
	total: number;
	delta: number;
};

export type ScoreBolt = {
	type: "bolt";
	total: number;
	delta: 1 | 2 | 3;
};

export type Score = ScoreNormal | ScoreBolt;
export type Round = {
	id: number;
	scores: Score[];
};

export const key = (id: string) => `wolverine1001:${id}`;

export const formatter = Intl.NumberFormat(navigator.languages, {
	signDisplay: "always",
});

export function isBolt(value: string): boolean {
	value = value.toLowerCase();
	return ["bolt", "b", "bt"].includes(value);
}

export function isBoltScore(score: Score): score is ScoreBolt {
	return score.type === "bolt";
}
