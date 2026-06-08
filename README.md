# OneThing

OneThing is a personal focus web app for choosing one main learning quest per day, breaking it into tiny tasks, and rewarding real deep-work sessions without turning the app itself into another distraction.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current prototype

- Today page with one Main Quest and concrete micro-checks
- Learning paths built from books, courses, challenges, or pasted table of contents
- Settings page for an OpenRouter API key and free model name
- Local JSON data in browser storage, with export/import backup
- Gacha Vault that mints one collectible card per completed lesson
- Basic anti-farming: a lesson can only mint one reward card
- Card pipeline: weighted rarity roll, matching archetype, verified local line pack, flavor pack, and image-generation prompt metadata
- Light/dark theme toggle and Vietnamese/English UI toggle
- Monthly streak calendar on the Today view
