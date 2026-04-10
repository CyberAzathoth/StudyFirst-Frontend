// ============================================================================
// Notifications Service - Assignment Due Tomorrow Reminders + Break Reminders
// ============================================================================

import {
  LocalNotifications,
} from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import type { Task } from "../types";

const NOTIF_ID_DUE_TOMORROW = 1001;
const NOTIF_ID_BREAK_COOLDOWN_RESET = 1002;
const NOTIF_ID_BREAK_REMINDER_1 = 1003;
const NOTIF_ID_BREAK_REMINDER_2 = 1004;
const NOTIF_ID_BREAK_REMINDER_3 = 1005;
const LAST_SCHEDULED_KEY = "notif_last_scheduled_date";

const BREAK_REMINDER_MESSAGES = [
  { title: "You're crushing it! 💪", body: "Seriously though, your brain needs a breather. Take a quick break!" },
  { title: "Respect the grind 🔥", body: "But rest is part of the grind too. A short break makes you sharper." },
  { title: "Look at you go! ⚡", body: "Don't forget — even machines need to cool down. Take 15 minutes." },
  { title: "Okay but like... breathe 😅", body: "You've been at it for a while. A break now saves you from burnout later." },
  { title: "Top student energy 📚", body: "Real ones know when to pause. Your break cooldown just reset!" },
  { title: "You're built different 🧠", body: "And built different people take strategic breaks. Go stretch or something." },
  { title: "No cap, you're doing great 🎯", body: "But your eyes have been on that screen too long. Rest up for a bit." },
  { title: "Grind mode: activated ✅", body: "Rest mode: also important. Your cooldown reset — take a break!" },
  { title: "W student behavior 👑", body: "Taking a break IS studying smart. Don't skip it." },
  { title: "Focus unlocked 🔓", body: "After a break. Seriously, go take one — your cooldown just reset." },
  { title: "You're almost there! 🏁", body: "But almost there on empty isn't great. Refuel with a quick break." },
  { title: "Big brain moves only 🧩", body: "And the biggest brain move right now? Taking a break before you burn out." },
  { title: "Still here? 👀", body: "We see you grinding. We're also lowkey worried. Take a break, fr." },
  { title: "Academic weapon loading... ⚔️", body: "Reload requires rest. Your break cooldown reset — use it!" },
  { title: "You didn't come this far to stop 💯", body: "You also didn't come this far to crash. Take 15 and come back stronger." },
  { title: "Productivity check 📊", body: "Studies say breaks improve focus by 20%. Just saying. Go take one." },
  { title: "Not to be that guy but... 😬", body: "You've been studying for a while. Your brain literally needs a break to retain info." },
  { title: "Okay professor mode is cool and all 🎓", body: "But even professors take coffee breaks. Your cooldown just reset!" },
  { title: "Real talk 💬", body: "You're doing amazing. And amazing people take breaks. Go rest for a bit." },
  { title: "Mission: Take A Break 🎮", body: "Objective: 15 minutes of not studying. You've earned it. Cooldown reset!" },
];

class NotificationsService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === "granted";
    } catch (e) {
      console.error("Notification permission error:", e);
      return false;
    }
  }

  async hasPermission(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      return display === "granted";
    } catch (e) {
      return false;
    }
  }

  // ── Due Tomorrow ──────────────────────────────────────────────────────────

  async scheduleDueTomorrowNotification(tasks: Task[]): Promise<void> {
    try {
      const permitted = await this.hasPermission();
      if (!permitted) {
        const granted = await this.requestPermissions();
        if (!granted) return;
      }
      const { value: notifEnabled } = await Preferences.get({ key: "notifications_enabled" });
if (notifEnabled === "false") return;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dueTomorrow = tasks.filter((task) => {
        if (task.completed) return false;
        const due = new Date(task.dueDate);
        const duePH = new Date(due.getTime() + 8 * 60 * 60 * 1000);
        const tomorrowPH = new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000);
        return (
          duePH.getUTCFullYear() === tomorrowPH.getUTCFullYear() &&
          duePH.getUTCMonth() === tomorrowPH.getUTCMonth() &&
          duePH.getUTCDate() === tomorrowPH.getUTCDate()
        );
      });

      await this.cancelDueTomorrowNotification();
      if (dueTomorrow.length === 0) return;

      const now = new Date();
      const fireAt = new Date();
      fireAt.setHours(12, 0, 0, 0);
      if (fireAt <= now) fireAt.setHours(20, 0, 0, 0);
      if (fireAt <= now) return;

      const count = dueTomorrow.length;
      const title = count === 1
        ? `📚 Assignment due tomorrow!`
        : `📚 ${count} assignments due tomorrow!`;
      const body = count === 1
        ? `"${dueTomorrow[0].title}" is due tomorrow. Don't wait till the last minute!`
        : `You have ${count} assignments due tomorrow. Stay ahead of the game!`;

      await LocalNotifications.schedule({
        notifications: [{
          id: NOTIF_ID_DUE_TOMORROW,
          title,
          body,
          schedule: { at: fireAt, allowWhileIdle: true },
          actionTypeId: "",
          extra: null,
        }]
      });

      await Preferences.set({ key: LAST_SCHEDULED_KEY, value: now.toDateString() });
    } catch (e) {
      console.error("[Notifications] Failed to schedule due tomorrow notif:", e);
    }
  }

  async cancelDueTomorrowNotification(): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIF_ID_DUE_TOMORROW }],
      });
    } catch (e) {}
  }

  async scheduleIfNeeded(tasks: Task[]): Promise<void> {
    try {
      const { value: lastScheduled } = await Preferences.get({ key: LAST_SCHEDULED_KEY });
      const today = new Date().toDateString();
      if (lastScheduled === today) return;
      await this.scheduleDueTomorrowNotification(tasks);
    } catch (e) {
      console.error("[Notifications] scheduleIfNeeded error:", e);
    }
  }

  async forceReschedule(tasks: Task[]): Promise<void> {
    await Preferences.remove({ key: LAST_SCHEDULED_KEY });
    await this.scheduleDueTomorrowNotification(tasks);
  }

  // ── Break Reminders ───────────────────────────────────────────────────────

  private getRandomMessage() {
    return BREAK_REMINDER_MESSAGES[
      Math.floor(Math.random() * BREAK_REMINDER_MESSAGES.length)
    ];
  }

  async scheduleBreakReminders(cooldownResetTime: Date): Promise<void> {
    try {
      const permitted = await this.hasPermission();
      if (!permitted) return;

      const { value: notifEnabled } = await Preferences.get({ key: "notifications_enabled" });
const { value: remindersEnabled } = await Preferences.get({ key: "break_reminders_enabled" });
if (notifEnabled === "false" || remindersEnabled === "false") return;

      // Cancel any existing break reminders first
      await this.cancelBreakReminders();

      const now = new Date();

      // Cooldown reset notification — fixed message
      const resetFireAt = new Date(cooldownResetTime);
      
      // Reminder 1 — 15 mins after cooldown reset
      const reminder1FireAt = new Date(cooldownResetTime.getTime() + 15 * 60 * 1000);

      // Reminder 2 — 60 mins after cooldown reset
      const reminder2FireAt = new Date(cooldownResetTime.getTime() + 60 * 60 * 1000);

      // Reminder 3 — 105 mins after cooldown reset (1hr 45min)
      const reminder3FireAt = new Date(cooldownResetTime.getTime() + 105 * 60 * 1000);

      const msg1 = this.getRandomMessage();
      const msg2 = this.getRandomMessage();
      const msg3 = this.getRandomMessage();

      const notifications = [];

      if (resetFireAt > now) {
        notifications.push({
          id: NOTIF_ID_BREAK_COOLDOWN_RESET,
          title: "☕ Break cooldown reset!",
          body: "You can take a break now. You've earned it — don't skip rest!",
          schedule: { at: resetFireAt, allowWhileIdle: true },
          actionTypeId: "",
          extra: null,
        });
      }

      if (reminder1FireAt > now) {
        notifications.push({
          id: NOTIF_ID_BREAK_REMINDER_1,
          title: msg1.title,
          body: msg1.body,
          schedule: { at: reminder1FireAt, allowWhileIdle: true },
          actionTypeId: "",
          extra: null,
        });
      }

      if (reminder2FireAt > now) {
        notifications.push({
          id: NOTIF_ID_BREAK_REMINDER_2,
          title: msg2.title,
          body: msg2.body,
          schedule: { at: reminder2FireAt, allowWhileIdle: true },
          actionTypeId: "",
          extra: null,
        });
      }

      if (reminder3FireAt > now) {
        notifications.push({
          id: NOTIF_ID_BREAK_REMINDER_3,
          title: msg3.title,
          body: msg3.body,
          schedule: { at: reminder3FireAt, allowWhileIdle: true },
          actionTypeId: "",
          extra: null,
        });
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch (e) {
      console.error("[Notifications] Failed to schedule break reminders:", e);
    }
  }

  async cancelBreakReminders(): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIF_ID_BREAK_COOLDOWN_RESET },
          { id: NOTIF_ID_BREAK_REMINDER_1 },
          { id: NOTIF_ID_BREAK_REMINDER_2 },
          { id: NOTIF_ID_BREAK_REMINDER_3 },
        ],
      });
    } catch (e) {}
  }
}

export const notificationsService = new NotificationsService();