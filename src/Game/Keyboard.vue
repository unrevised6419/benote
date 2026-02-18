<template>
	<div ref="keyboard" class="the-keyboard"></div>
</template>

<script setup lang="ts">
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from "vue";

const emits = defineEmits<{
	add: [];
	next: [];
	clear: [];
	bolt: [];
	minus: [];
	number: [num: number];
	back: [];
}>();

const keyboardRef = useTemplateRef("keyboard");
const keyboard = shallowRef<Keyboard>();

const numpadDisplay: Record<string, string> = {
	"{numpad0}": "0",
	"{numpad1}": "1",
	"{numpad2}": "2",
	"{numpad3}": "3",
	"{numpad4}": "4",
	"{numpad5}": "5",
	"{numpad6}": "6",
	"{numpad7}": "7",
	"{numpad8}": "8",
	"{numpad9}": "9",
};

function handleKeyPress(button: string) {
	if (button === "{add}") {
		emits("add");
		return;
	}

	if (button === "{next}") {
		emits("next");
		return;
	}

	if (button === "{back}") {
		emits("back");
		return;
	}

	if (button === "{clear}") {
		emits("clear");
		return;
	}

	if (button === "{bolt}") {
		emits("bolt");
		return;
	}

	if (button === "{minus}") {
		emits("minus");
		return;
	}

	const buttonValue = numpadDisplay[button];

	if (!buttonValue) {
		return;
	}

	const theNumber = parseInt(buttonValue, 10);

	if (Number.isNaN(theNumber)) {
		return;
	}

	emits("number", theNumber);
}

onMounted(() => {
	if (!keyboardRef.value) return;

	keyboard.value = new Keyboard(keyboardRef.value, {
		onKeyPress: handleKeyPress,
		layout: {
			default: [
				"{numpad1} {numpad2} {numpad3} {numpad4} {numpad5} {numpad6} {numpad7} {numpad8} {numpad9}",
				"{bolt} {numpad0} {minus}",
				"{clear} {back} {next} {add}",
			],
		},
		display: {
			"{add}": "➕",
			"{clear}": "🗑️",
			"{bolt}": "Bolt",
			"{minus}": "-10",
			"{next}": "⏭️",
			"{back}": "⏮️",
			...numpadDisplay,
		},
		theme: "hg-theme-default hg-layout-numeric",
	});
});

onUnmounted(() => {
	keyboard.value?.destroy();
});
</script>
