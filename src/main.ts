import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createWebHistory, createRouter } from "vue-router";
import "./style.css";
import App from "./App.vue";
import Board from "./Board.vue";
import Lobby from "./Lobby.vue";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", component: Lobby },
		{ path: "/:id", component: Board },
	],
});

createApp(App).use(router).use(VueQueryPlugin).mount("#app");
