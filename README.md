# SkyBlock Viewer

A desktop app for looking up Hypixel SkyBlock profiles by Minecraft username. It shows profile overview, skills, slayers, dungeon stats and personal bests, Glacite Tunnels data, and a browsable member-data explorer.

## Downloads

Windows installers are available on the project’s GitHub Releases page.

## Run

Install dependencies, then start the desktop app in development mode:

```sh
npm install
npm run electron:dev
```

On first launch, enter a Hypixel API key. The app saves it locally for later use.

## Build

```sh
npm run build
```

Electron Builder writes installers to `dist-electron/` for Windows, macOS, or Linux.
