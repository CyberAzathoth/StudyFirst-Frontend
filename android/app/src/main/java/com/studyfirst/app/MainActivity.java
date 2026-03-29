package com.studyfirst.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.util.HashSet;
import java.util.Set;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register AppLock plugin
        registerPlugin(AppLockPlugin.class);

        // Enable app locking by default
        android.content.SharedPreferences prefs = getSharedPreferences("AppLocker", MODE_PRIVATE);
        android.content.SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("locking_enabled", true);

        Set<String> lockedApps = new HashSet<>();
        lockedApps.add("com.instagram.android");
        lockedApps.add("com.zhiliaoapp.musically");
        lockedApps.add("com.facebook.katana");
        lockedApps.add("com.twitter.android");
        editor.putStringSet("locked_apps", lockedApps);
        editor.apply();
    }
}