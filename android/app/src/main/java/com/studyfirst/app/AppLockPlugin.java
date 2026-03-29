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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "AppLock")
public class AppLockPlugin extends Plugin {

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);

        JSArray result = new JSArray();
        for (ApplicationInfo app : apps) {
            if (pm.getLaunchIntentForPackage(app.packageName) == null) continue;
            JSObject appInfo = new JSObject();
            appInfo.put("packageName", app.packageName);
            appInfo.put("appName", pm.getApplicationLabel(app).toString());
            result.put(appInfo);
        }

        JSObject ret = new JSObject();
        ret.put("apps", result);
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
}