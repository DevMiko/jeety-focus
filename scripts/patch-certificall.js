const fs = require('fs');
const path = require('path');

const SDK_ROOT = path.join(__dirname, '..', 'node_modules', 'certificall-mobile-sdk-react-native');

// ─── ANDROID Patch 1 : build.gradle — chemin AAR dev → bundled libs/ ─────────
const gradleFile = path.join(SDK_ROOT, 'android', 'build.gradle');
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
    console.log('patch-certificall: Android build.gradle patched (AAR path: libs/certificall-trust-sdk-release.aar).');
  } else {
    console.log('patch-certificall: Android build.gradle already OK, skipping.');
  }
}

// ─── ANDROID Patch 2 : CertificallTrustModule.kt — RN 0.73+ compatibility ────
const ktFile = path.join(
  SDK_ROOT, 'android', 'src', 'main', 'java',
  'com', 'certificall', 'reactnative', 'CertificallTrustModule.kt'
);

if (fs.existsSync(ktFile)) {
  let src = fs.readFileSync(ktFile, 'utf8');
  if (!src.includes('activity: Activity?') && !src.includes('intent: Intent?') && !src.includes('val activity = currentActivity')) {
    console.log('patch-certificall: CertificallTrustModule.kt already patched, skipping.');
  } else {
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
    console.log('patch-certificall: CertificallTrustModule.kt patched for RN 0.73+ compatibility.');
  }
}

// ─── iOS Patch 1 : CertificallTrustRN.podspec — créer si absent ───────────────
const podspecFile = path.join(SDK_ROOT, 'CertificallTrustRN.podspec');
if (!fs.existsSync(podspecFile)) {
  const podspec = `Pod::Spec.new do |s|
  s.name         = "CertificallTrustRN"
  s.version      = "0.1.3"
  s.summary      = "Certificall Mobile SDK React Native Bridge"
  s.description  = "React Native bridge for Certificall Trust SDK (iOS)"
  s.homepage     = "https://certificall.app"
  s.license      = { :type => "MIT" }
  s.author       = "Certificall"
  s.platform     = :ios, "16.0"
  s.source       = { :path => "." }

  s.source_files        = "ios/**/*.{m,swift}"
  s.vendored_frameworks = "ios/CertificallTrust.xcframework"

  s.dependency "React-Core"
  s.swift_version = "5.7"
end
`;
  fs.writeFileSync(podspecFile, podspec, 'utf8');
  console.log('patch-certificall: CertificallTrustRN.podspec created.');
} else {
  console.log('patch-certificall: CertificallTrustRN.podspec already exists, skipping.');
}

// ─── iOS Patch 2 : react-native.config.js — ajouter plateforme iOS ────────────
const rnConfigFile = path.join(SDK_ROOT, 'react-native.config.js');
if (fs.existsSync(rnConfigFile)) {
  const rnConfig = fs.readFileSync(rnConfigFile, 'utf8');
  if (!rnConfig.includes('ios:')) {
    const patched = rnConfig.replace(
      /platforms:\s*\{/,
      `platforms: {
      ios: {},`
    );
    fs.writeFileSync(rnConfigFile, patched, 'utf8');
    console.log('patch-certificall: react-native.config.js patched (iOS platform added).');
  } else {
    console.log('patch-certificall: react-native.config.js already has iOS config, skipping.');
  }
}
