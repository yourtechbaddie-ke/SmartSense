# SmartSense

SmartSense is an inventory-intelligence app for small commerce businesses. It includes an overview dashboard, product catalogue and stock thresholds, sales recording, stock/restock insights, workspace preferences, and CSV export.

## Brand palette

- Merlot: `#542536`
- Powder Blue: `#AFCBE3`
- Alabaster: `#F7F4EF`

## Run source checks

Requires Node.js 20 or newer.

```sh
npm install
npm test
```

## Build an Android APK

The GitHub Actions workflow **Build Android APK** installs the Android toolchain, wraps the web app with Capacitor, runs the source smoke tests, compiles a debug APK, and uploads it as a workflow artifact.

1. Open the repository's **Actions** tab.
2. Open the latest successful **Build Android APK** run.
3. Download the `SmartSense-debug-apk` artifact ZIP.
4. Extract it and open `app-debug.apk` on your Android phone.
5. Approve Android's install-from-this-source prompt if asked.

This is an installable **debug APK** for direct testing, not a Play Store release. Keep Android's package installer security prompts enabled and install only a build from this repository.

## Data and privacy

The current app stores records in browser/WebView local storage on that device. It does not currently sync across devices or provide cloud backups. Export business records regularly and do not treat demo figures as accounting or tax records.

## Build locally

```sh
npm install
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.
