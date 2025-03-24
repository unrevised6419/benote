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
export type Scores = [Score, Score, Score, Score];
export type Round = {
	id: number;
	scores: Scores;
};

export const key = (id: string) => `wolverine1000:${id}`;

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
