# FL Plates

Installable offline-friendly tracker for Florida license plates.

## What It Does

- Track found plates with timestamp, GPS coordinates, and best-effort locality name.
- Browse an expanded `v1.3` catalog with current and legacy plate designs.
- Open a plate image to view a larger preview and switch between available versions.
- Read beneficiary and plate details directly in the enlarged plate modal.
- Filter by `All`, `Found`, or `Not found`.
- Arrange plates by `Categories`, `A-Z`, or `Z-A`.
- Use a more granular category model instead of the old large miscellaneous bucket.
- Open `Explore` for recent sightings, stats, and a dynamic pushpin map.
- Open `Settings` to switch color mode and hide or show optional main-screen controls.
- Open `Help` for a quick how-to-play sheet.
- Share the app with a prefilled message and install instructions.
- Install to iPhone or Android home screen and continue using it offline after first load.

## Local Development

```powershell
npm install
npm run dev:host
```

For LAN testing on the same Wi-Fi, open the host IP and Vite port shown in the terminal.

## Production Build

```powershell
npm run build
```

The build step also regenerates the runtime plate driver, the PWA icons, and the plate asset manifest used by the service worker.

To regenerate the runtime plate driver without doing a full build:

```powershell
npm run generate:plate-driver
```

## GitHub Pages Deployment

This repo is prepared to deploy to GitHub Pages with GitHub Actions.

### 1. Create the GitHub repo

Create a new repository in your GitHub account. A matching name like `florida-plates-game` is the easiest option.

### 2. Connect this local repo to GitHub

Replace `<repo-name>` if you choose a different repository name:

```powershell
git remote add origin https://github.com/Try2BWise/<repo-name>.git
git push -u origin master
```

### 3. Turn on GitHub Pages

In GitHub:

1. Open the repository.
2. Go to `Settings > Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.

After that, each push to `master` will build and deploy the app automatically.

### 4. Open the live site

For the current custom domain, the site URL is:

[https://gorillagrin.com/florida-plates-game/](https://gorillagrin.com/florida-plates-game/)

### 5. Install on iPhone

1. Open the Pages URL in Safari.
2. Let the app load fully once while online.
3. Tap `Share`.
4. Tap `Add to Home Screen`.
5. Launch it from the home screen.

### 6. Install on Android

1. Open the Pages URL in Chrome or another modern Android browser.
2. Let the app load fully once while online.
3. Use the browser's `Add to Home screen` or `Install app` option.
4. Launch it from the home screen.

## Notes

- The app is a PWA, not a native App Store or Play Store app.
- Offline use works after the app shell and plate assets have been loaded successfully once.
- If a home-screen install ever appears stuck on an older version, open the site in the browser first so the latest service worker can update.
- Specialty plate images are not the intellectual property of Gorilla Grin. They belong to the Florida Department of Highway Safety and Motor Vehicles and are displayed here for identification purposes under a fair use claim.

## Project Docs

- Release process: [C:\Users\bwise\Documents\florida-plates-game\RELEASING.md](C:\Users\bwise\Documents\florida-plates-game\RELEASING.md)
- Version roadmap: [C:\Users\bwise\Documents\florida-plates-game\ROADMAP.md](C:\Users\bwise\Documents\florida-plates-game\ROADMAP.md)
