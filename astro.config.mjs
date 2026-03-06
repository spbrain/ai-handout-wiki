// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'AI-Handouts by Pobi',
			customCss: [
			        './src/styles/custom.css',
		       ],
			sidebar: [
				{
					label: 'AI 강의 목차',
					autogenerate: { directory: 'AI 프로젝트' },
				},
			],
		}),
	],
});
