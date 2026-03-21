# Florida Plate Tracker

Installable offline-friendly tracker for Florida specialty plates.

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

The build step also regenerates the PWA icons and plate asset manifest used by the service worker.

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

### 4. Install on iPhone

Once Pages finishes deploying:

1. Open the Pages URL in Safari.
2. Let the app load fully once while online.
3. Tap `Share`.
4. Tap `Add to Home Screen`.
5. Launch it from the home screen.

The service worker caches the app shell and plate assets so it can keep working offline after the first full load.
