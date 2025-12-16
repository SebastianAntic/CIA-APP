# Android Deployment Guide for SmartCIA

This guide provides the exact files needed to deploy your React web application as a native Android app using Android Studio.

## Prerequisites
1.  **Host your Web App**: Deploy your React code to Vercel, Netlify, or similar. You need the live `https://...` URL.
2.  **Android Studio**: Create a new project using **"Empty Views Activity"** (Java).
    *   **Package Name**: `com.smartcia.app` (If you use a different name, update the `package` line in the Java file).
    *   **Minimum SDK**: API 24 (Android 7.0)

---

## File 1: Android Manifest
**Location**: `app/src/main/AndroidManifest.xml`
**Action**: Add the `INTERNET` permission tag above the `<application>` tag.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- 1. ADD THIS PERMISSION -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmartCIA"
        tools:targetApi="31">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

---

## File 2: Layout XML
**Location**: `app/src/main/res/layout/activity_main.xml`
**Action**: Replace the entire file content with this code to create a full-screen WebView.

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webview"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

---

## File 3: Java Activity
**Location**: `app/src/main/java/com/smartcia/app/MainActivity.java`
**Action**: Replace the entire file content.
**IMPORTANT**: 
1. Replace `com.smartcia.app` with your actual package name if different.
2. Replace `"https://your-smartcia-url.vercel.app"` with your actual deployed URL.

```java
package com.smartcia.app;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;
    // TODO: REPLACE THIS WITH YOUR ACTUAL DEPLOYED URL
    private static final String APP_URL = "https://your-smartcia-url.vercel.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 1. Find the WebView from XML
        myWebView = findViewById(R.id.webview);

        // 2. Configure Settings
        WebSettings webSettings = myWebView.getSettings();
        
        // Critical for React: Enable JavaScript
        webSettings.setJavaScriptEnabled(true);
        
        // Critical for your Mock DB: Enable LocalStorage (DOM Storage)
        webSettings.setDomStorageEnabled(true);
        
        // Optional: improve performance
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // 3. Keep navigation inside the app (don't open Chrome)
        myWebView.setWebViewClient(new WebViewClient());

        // 4. Load the URL
        myWebView.loadUrl(APP_URL);
    }

    // Handle the physical "Back" button on Android
    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

## Step 4: Build & Run
1.  **Connect Device**: Plug in your Android phone. Ensure "USB Debugging" is on in Developer Options.
2.  **Run**: Click the green **Play** button in the top toolbar of Android Studio.
3.  **Generate APK**: To share the app file, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**. The file will be located in `app/build/outputs/apk/debug/`.
