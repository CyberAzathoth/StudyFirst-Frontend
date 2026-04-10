package com.studyfirst.app;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "AppLock")
public class AppLockPlugin extends Plugin {

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<ApplicationInfo> apps = pm.getInstalledApplications(0);

        JSArray result = new JSArray();
        for (ApplicationInfo app : apps) {
            if (app.packageName.equals(getContext().getPackageName())) continue;
            if (pm.getLaunchIntentForPackage(app.packageName) == null) continue;

            String appName = pm.getApplicationLabel(app).toString();
            if (appName.equals(app.packageName)) continue;

            JSObject appInfo = new JSObject();
            appInfo.put("packageName", app.packageName);
            appInfo.put("appName", appName);
            result.put(appInfo);
        }

        // Sort alphabetically
        List<JSObject> appList = new ArrayList<>();
        for (int i = 0; i < result.length(); i++) {
            try { appList.add((JSObject) result.get(i)); } catch (Exception e) {}
        }
        appList.sort((a, b) -> {
            try { return a.getString("appName").compareToIgnoreCase(b.getString("appName")); }
            catch (Exception e) { return 0; }
        });
        JSArray sorted = new JSArray();
        for (JSObject obj : appList) sorted.put(obj);

        JSObject ret = new JSObject();
        ret.put("apps", sorted);
        call.resolve(ret);
    }

    @PluginMethod
    public void setLockedApps(PluginCall call) {
        JSArray packages = call.getArray("packages");
        Set<String> lockedApps = new HashSet<>();
        try {
            for (int i = 0; i < packages.length(); i++) {
                lockedApps.add(packages.getString(i));
            }
        } catch (Exception e) {}

        SharedPreferences prefs = getContext().getSharedPreferences("AppLocker", 0);
        prefs.edit().putStringSet("locked_apps", lockedApps).apply();
        call.resolve();
    }

    @PluginMethod
    public void pauseLocking(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences("AppLocker", 0);
        prefs.edit().putBoolean("locking_enabled", false).apply();
        call.resolve();
    }

    @PluginMethod
    public void resumeLocking(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences("AppLocker", 0);
        prefs.edit().putBoolean("locking_enabled", true).apply();
        call.resolve();
    }

    @PluginMethod
    public void getLockingState(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences("AppLocker", 0);
        boolean enabled = prefs.getBoolean("locking_enabled", true);
        Set<String> lockedApps = prefs.getStringSet("locked_apps", new HashSet<>());

        JSObject ret = new JSObject();
        ret.put("enabled", enabled);
        JSArray arr = new JSArray();
        for (String pkg : lockedApps) arr.put(pkg);
        ret.put("lockedApps", arr);
        call.resolve(ret);
    }
}