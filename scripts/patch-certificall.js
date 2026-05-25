const fs = require('fs');
const path = require('path');

const ktFile = path.join(
  __dirname, '..', 'node_modules',
  'certificall-mobile-sdk-react-native',
  'android', 'src', 'main', 'java',
  'com', 'certificall', 'reactnative',
  'CertificallTrustModule.kt'
);

const gradleFile = path.join(
  __dirname, '..', 'node_modules',
  'certificall-mobile-sdk-react-native',
  'android', 'build.gradle'
);

// ─── Patch 1 : build.gradle — chemin AAR dev → bundled libs/ ────────────────
if (fs.existsSync(gradleFile)) {
  let gradle = fs.readFileSync(gradleFile, 'utf8');
  if (gradle.includes('../../../sdk/android') || gradle.includes('certificall-trust-sdk-debug.aar')) {
    gradle = gradle.replace(
      /def sdkAndroidDir = new File\(rootProject\.projectDir, '\.\.\/\.\.\/\.\.\/sdk\/android'\)\s*\ndef sdkAarDir = new File\(sdkAndroidDir, 'build\/outputs\/aar'\)/,
      `def sdkAarDir = new File(projectDir, 'libs')`
    );
    gradle = gradle.replace(
      "implementation files(new File(sdkAarDir, 'certificall-trust-sdk-debug.aar'))",
      "implementation files(new File(sdkAarDir, 'certificall-trust-sdk-release.aar'))"
    );
    fs.writeFileSync(gradleFile, gradle, 'utf8');
    console.log('patch-certificall: ✓ build.gradle patched (AAR path: libs/certificall-trust-sdk-release.aar).');
  } else {
    console.log('patch-certificall: build.gradle already OK, skipping.');
  }
}

// ─── Patch 2 : CertificallTrustModule.kt — RN 0.73+ compatibility ───────────
if (!fs.existsSync(ktFile)) {
  console.log('patch-certificall: KT file not found, skipping.');
  process.exit(0);
}

let src = fs.readFileSync(ktFile, 'utf8');

if (!src.includes('activity: Activity?') && !src.includes('intent: Intent?') && !src.includes('val activity = currentActivity')) {
  console.log('patch-certificall: CertificallTrustModule.kt already patched, skipping.');
  process.exit(0);
}

src = src.replace(
  /override fun onActivityResult\(activity: Activity\?, requestCode: Int, resultCode: Int, data: Intent\?\) \{[\s\S]*?sdk\.handleActivityResult\(activity, requestCode, resultCode, data\)\s*\}/,
  `override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        Log.d("CertificallRN", "Forwarding activity result to SDK (requestCode=\$requestCode, resultCode=\$resultCode)")
        sdk.handleActivityResult(activity, requestCode, resultCode, data)
    }`
);

src = src.replace(
  'override fun onNewIntent(intent: Intent?) {',
  'override fun onNewIntent(intent: Intent) {'
);

src = src.replace(
  /val activity = currentActivity\s*\n\s*if \(activity == null\) \{\s*\n\s*promise\.reject\("CAMERA_ERROR", "No activity available"\)\s*\n\s*return\s*\n\s*\}/,
  `val activity = reactContext.currentActivity ?: run {
            promise.reject("CAMERA_ERROR", "No activity available")
            return
        }`
);

fs.writeFileSync(ktFile, src, 'utf8');
console.log('patch-certificall: ✓ CertificallTrustModule.kt patched for RN 0.73+ compatibility.');
