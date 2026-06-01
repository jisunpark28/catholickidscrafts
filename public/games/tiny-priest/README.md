# Tiny Priest

Tiny Priest is an interactive church-themed web experience built with plain HTML/CSS/JS and Three.js.
Users can pick a character, enter the church, navigate a 3D interior, and follow a guided Mass flow.

## Features

- Character selection (Priest / Nun)
- 2D entry scene with transition into 3D space
- Third-person movement controls in a voxel-style church
- Gesture controls and automatic Mass sequence progression
- Liturgical season color logic for altar cloth rendering

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
├── src/
│   ├── constants.js
│   └── liturgy.js
├── tests/
│   └── liturgy.test.js
├── assets/
├── vendor/
└── docs/
```

## Run locally

No build step is required for the app itself, but you should serve it over HTTP.

### 1) Start a local static server

Using Python:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

### 2) Controls

- Move: Arrow keys or `W/A/S/D`
- Jump: `Space`
- Gestures: `1` to `7`
- Auto Mass sequence: `M`

## Development quality checks

Install dependencies:

```bash
npm install
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

Format check:

```bash
npm run format
```

## License

MIT (see `LICENSE`)
