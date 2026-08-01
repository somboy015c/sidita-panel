# Sidita Panel — Windows & macOS Desktop App

This repo wraps the [sidita-admin website](https://github.com/somboy015c/sidita-admin)
into a native Windows and macOS desktop app using [Electron](https://www.electronjs.org/).
Same idea as the mobile Sidita Fleet app, different wrapper: Electron takes
your existing HTML/CSS/JS and runs it in its own window instead of a browser
tab, then packages that into a real Windows installer (`.exe`) and macOS app
(`.dmg`).

```
sidita-panel/
├── www/                       ← copy of the admin site (index.html, favicon.png, logo.png, logo_white.png)
├── main.js                    ← Electron entry point — opens a window and loads www/index.html
├── build/icon.png             ← single 1024×1024 source icon; electron-builder auto-generates .ico/.icns from it
├── scripts/sync-web.sh        ← THE CONVERSION SCRIPT — pulls latest admin site into www/
├── package.json                ← app id/name + electron-builder packaging config
└── .github/workflows/          ← CI that builds the Windows & macOS apps automatically
```

Your site already calls the same live backend (`sidita-backend.onrender.com`)
as the mobile app, so the desktop app works identically — just full-screen
in its own window with a native icon instead of a browser tab.

## Repo secret required: GH_TOKEN

Same as the mobile project: the release-publishing steps in
`windows-build.yml` and `mac-build.yml` authenticate with a personal access
token stored as the `GH_TOKEN` repo secret, rather than the default
`GITHUB_TOKEN`. Make sure that secret exists with `contents: write` access,
or the release publish step will fail.

## Fullscreen behavior

The app launches in true fullscreen (no title bar, no window chrome) via
`fullscreen: true` in `main.js`. Since that hides the normal way to
minimize/resize/close, **F11 toggles fullscreen on/off** — without it,
users on Windows would have no way to get back to their desktop. If you'd
rather it just launch maximized (keeping the title bar and window
controls) instead of true fullscreen, change `fullscreen: true` to
`show: false` + call `win.maximize()` before `win.show()` in `main.js`.

## App-only overrides (hiding UI elements just for the app)

`overrides/overrides.css` hides the "Download App" button and its platform
dropdown (`.download-dropdown-wrap`) — it doesn't make sense to prompt
someone to download the app when they're already running it.
`scripts/sync-web.sh` injects this file into `www/index.html` after every
sync, so it keeps applying even as the admin site content updates. To
change what's hidden, edit `overrides/overrides.css` directly (not
`www/index.html`, which gets overwritten on the next sync).

## Quick start: from upload to download link

1. **Create a GitHub repo** and upload this whole `sidita-panel` folder to
   it (drag-and-drop via "Add file → Upload files," or `git push`).
2. Go to the **Actions** tab. If the builds didn't already start from your
   upload, run **Build Windows App** → **Run workflow**, and separately
   **Build macOS App** → **Run workflow**.
3. Wait for both to finish (green checkmark).
4. Go to your repo's **Releases** page:
   `https://github.com/<you>/<repo>/releases`. You'll see two releases:
   `latest-windows` and `latest-mac`.
5. Your permanent download links:
   ```
   https://github.com/<you>/<repo>/releases/download/latest-windows/sidita-panel.exe
   https://github.com/<you>/<repo>/releases/download/latest-mac/sidita-panel.dmg
   ```
   These never change — give them out now. Every future build (triggered by
   a push, or by re-running Sync Website) overwrites the same release, so
   the same link always serves the newest build.

## Important: unsigned-app warnings

Neither build is signed with a paid developer certificate, so first-time
users will see a warning. This is normal for unsigned software and doesn't
mean anything is broken:

- **Windows**: SmartScreen will say "Windows protected your PC." Users click
  **More info → Run anyway**.
- **macOS**: Gatekeeper will refuse to open the app the normal way and may
  say it's "damaged" or from an "unidentified developer." Users must
  **right-click the app → Open → Open** (only required once).

To remove these warnings for your users:
- **Windows**: buy a code-signing certificate (~$100–400/yr from a CA like
  DigiCert/SSL.com) and sign the `.exe` — this can be added to
  `windows-build.yml` as a signing step once you have one.
- **macOS**: enroll in the [Apple Developer Program](https://developer.apple.com/programs/)
  ($99/yr), then sign and *notarize* the app — Apple's automated malware
  scan that's required before Gatekeeper will trust it without a warning.
  This needs a similar signing-secrets setup to the iOS build in the mobile
  project (`BUILD_CERTIFICATE_BASE64`, etc.) plus a notarization step; happy
  to wire this up once you have the account.

## Syncing the website without a terminal

Push this repo to GitHub, then go to **Actions → Sync Website into App →
Run workflow**. It pulls the latest `sidita-admin` content into `www/` and
commits the change back automatically — no local git or terminal needed.
That push also automatically re-triggers the Windows and macOS builds, so
your download links update with the new content shortly after.

## Changing the icon later

1. Replace `build/icon.png` (square, 1024×1024) — you can upload it directly
   through the GitHub web UI into the `build/` folder.
2. That push automatically re-triggers both the Windows and macOS builds
   (electron-builder converts this single PNG into `.ico`/`.icns`
   automatically at build time — there's no separate generation step).
3. The updated icon shows up in the next release.

## Local development (optional)

```bash
npm install
npm start          # runs the app locally in a window
npm run build:win  # requires Windows, or Wine on Linux/Mac
npm run build:mac  # requires macOS
```

## Distributing outside a direct download link

If you'd rather go through Microsoft Store or the Mac App Store instead of
a direct link, both are possible with Electron but need extra packaging
steps (MSIX for Microsoft Store, a Mac App Store-specific build with
sandboxing entitlements) — let me know if you want that set up instead of
or alongside the direct-download releases above.
