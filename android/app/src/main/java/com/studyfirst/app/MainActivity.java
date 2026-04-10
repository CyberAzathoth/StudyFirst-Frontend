package com.studyfirst.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);  // ← add this
        registerPlugin(AppLockPlugin.class);
        registerPlugin(GoogleAuth.class);

        android.content.SharedPreferences prefs = getSharedPreferences("AppLocker", MODE_PRIVATE);
        if (!prefs.contains("initialized")) {
            android.content.SharedPreferences.Editor editor = prefs.edit();
            editor.putBoolean("locking_enabled", true);
            editor.putBoolean("initialized", true);
            editor.putStringSet("locked_apps", new java.util.HashSet<>());
            editor.apply();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        try {
            GoogleSignInOptions gso = new GoogleSignInOptions
                .Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();
            GoogleSignIn.getClient(this, gso);
        } catch (Exception e) {}
    }
}