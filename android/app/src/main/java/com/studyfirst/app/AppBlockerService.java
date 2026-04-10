package com.studyfirst.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import java.util.HashSet;
import java.util.Set;

public class AppBlockerService extends AccessibilityService {

    private static final String TAG = "AppBlockerService";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        try {
            if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
            if (event.getPackageName() == null) return;

            String packageName = event.getPackageName().toString();

            // Ignore our own app
            if (packageName.equals(getPackageName())) return;

            SharedPreferences prefs = getSharedPreferences("AppLocker", MODE_PRIVATE);
            boolean lockingEnabled = prefs.getBoolean("locking_enabled", false);
            Set<String> lockedApps = prefs.getStringSet("locked_apps", new HashSet<>());

            Log.d(TAG, "Window changed: " + packageName + " locking=" + lockingEnabled);

            if (lockingEnabled && lockedApps.contains(packageName)) {
                Log.d(TAG, "Blocking: " + packageName);
                Intent intent = new Intent(this, BlockActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                intent.putExtra("blocked_app", packageName);
                startActivity(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onAccessibilityEvent", e);
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service interrupted");
    }

    @Override
    protected void onServiceConnected() {
        try {
            AccessibilityServiceInfo info = new AccessibilityServiceInfo();
            info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED |
                    AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED;
            info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
            info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS |
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
            info.notificationTimeout = 100;
            setServiceInfo(info);
            Log.d(TAG, "AppBlockerService connected successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error in onServiceConnected", e);
        }
    }
}