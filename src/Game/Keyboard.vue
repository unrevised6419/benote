<template>
	<div ref="keyboard" class="the-keyboard"></div>
</template>

<script setup lang="ts">
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from "vue";

const emits = defineEmits<{
	hang: [];
	clear: [];
	bolt: [];
	minus: [];
	number: [num: number];
	add: [];
	next: [];
}>();

const keyboardRef = useTemplateRef("keyboard");
const keyboard = shallowRef<Keyboard>();

type NumCommand = (typeof numCommands)[number];
const numCommands = [
	"{num1}",
	"{num2}",
	"{num3}",
	"{num4}",
	"{num5}",
	"{num6}",
	"{num7}",
	"{num8}",
	"{num9}",
	"{num0}",
] as const;

type Command = (typeof commands)[number];
const commands = [
	...numCommands,
	"{hang}",
	"{bolt}",
	"{minus}",
	"{clear}",
	"{add}",
	"{next}",
] as const;

const numCommandDisplay: Record<NumCommand, string> = {
	"{num0}": "0",
	"{num1}": "1",
	"{num2}": "2",
	"{num3}": "3",
	"{num4}": "4",
	"{num5}": "5",
	"{num6}": "6",
	"{num7}": "7",
	"{num8}": "8",
	"{num9}": "9",
};

const commandDisplay: Record<Command, string> = {
	...numCommandDisplay,
	"{hang}": "Ouă",
	"{clear}": "Curăță",
	"{bolt}": "Bolt",
	"{minus}": "Minus",
	"{add}": "Adaugă",
	"{next}": "Următorul",
};

const layout: ReadonlyArray<ReadonlyArray<Command>> = [
	numCommands,
	["{hang}", "{bolt}", "{minus}"],
	["{clear}", "{next}", "{add}"],
];

function handleKeyPress(button: string) {
	const command = button as Command;

	if (command === "{hang}") {
		emits("hang");
		return;
	}

	if (command === "{clear}") {
		emits("clear");
		return;
	}

	if (command === "{bolt}") {
		emits("bolt");
		return;
	}

	if (command === "{minus}") {
		emits("minus");
		return;
	}

	if (command === "{add}") {
		emits("add");
		return;
	}

	if (command === "{next}") {
		emits("next");
		return;
	}

	const buttonValue = numCommandDisplay[command];

	if (!buttonValue) {
		return;
	}

	const theNumber = Number.parseInt(buttonValue, 10);

	if (Number.isNaN(theNumber)) {
		return;
	}

	emits("number", theNumber);
}

onMounted(() => {
	if (!keyboardRef.value) return;

	keyboard.value = new Keyboard(keyboardRef.value, {
		onKeyPress: handleKeyPress,
		layout: { default: layout.map((row) => row.join(" ")) },
		display: commandDisplay,
		theme: "hg-theme-default hg-layout-numeric",
	});
});

onUnmounted(() => {
	keyboard.value?.destroy();
});
</script>
