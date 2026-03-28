# API Service Usage Examples

This document shows how to use the API services in your React components.

## Table of Contents

1. [Authentication](#authentication)
2. [Tasks Management](#tasks-management)
3. [Google Classroom](#google-classroom)
4. [Streaks](#streaks)
5. [Badges & Achievements](#badges--achievements)
6. [Break Sessions](#break-sessions)
7. [Settings](#settings)
8. [Error Handling](#error-handling)

---

## Authentication

### Login Example

```tsx
import { useState } from 'react';
import { authService } from '../services';
import type { ApiError } from '../types';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      console.log('Logged in:', response.user);
      // Navigate to dashboard
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
```

### Google Authentication

```tsx
import { authService } from '../services';

function GoogleAuthButton() {
  const handleGoogleAuth = async () => {
    try {
      // In a real implementation, you would:
      // 1. Redirect to Google OAuth page
      // 2. Get the authorization code from callback
      // 3. Send it to your backend
      
      const authCode = 'GOOGLE_AUTH_CODE_FROM_CALLBACK';
      const redirectUri = 'YOUR_REDIRECT_URI';
      
      const response = await authService.googleAuth({
        code: authCode,
        redirectUri,
      });

      console.log('Google auth successful:', response.user);
      if (response.isNewUser) {
        console.log('Welcome, new user!');
      }
    } catch (err) {
      console.error('Google auth failed:', err);
    }
  };

  return (
    <button onClick={handleGoogleAuth}>
      Sign in with Google
    </button>
  );
}
```

### Check Authentication Status

```tsx
import { useEffect, useState } from 'react';
import { authService } from '../services';
import type { User } from '../types';

function ProtectedRoute() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Failed to get user:', err);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

---

## Tasks Management

### Fetch Today's Tasks

```tsx
import { useEffect, useState } from 'react';
import { tasksService } from '../services';
import type { Task } from '../types';

function TodayTasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const todayTasks = await tasksService.getTasksToday();
        setTasks(todayTasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <h2>Today's Tasks ({tasks.length})</h2>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.class}</p>
          <p>Due: {task.dueTime}</p>
        </div>
      ))}
    </div>
  );
}
```

### Create New Task

```tsx
import { useState } from 'react';
import { tasksService } from '../services';
import type { CreateTaskRequest } from '../types';

function AddTaskForm() {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    class: '',
    dueDate: new Date().toISOString(),
    dueTime: '11:59 PM',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTask = await tasksService.createTask(formData);
      console.log('Task created:', newTask);
      // Reset form or navigate
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Task title"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
      />
      <button type="submit">Add Task</button>
    </form>
  );
}
```

### Complete/Uncomplete Task

```tsx
import { tasksService } from '../services';
import type { Task } from '../types';

function TaskItem({ task, onUpdate }: { task: Task; onUpdate: () => void }) {
  const handleToggle = async () => {
    try {
      if (task.source !== 'manual') {
        alert('Google Classroom tasks cannot be marked complete in the app');
        return;
      }

      if (task.completed) {
        await tasksService.uncompleteTask(task.id);
      } else {
        await tasksService.completeTask(task.id);
      }
      
      onUpdate(); // Refresh task list
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  return (
    <div>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        disabled={task.source === 'google-classroom'}
      />
      <span>{task.title}</span>
    </div>
  );
}
```

### Filter Tasks

```tsx
import { useEffect, useState } from 'react';
import { tasksService } from '../services';
import type { Task, TaskQueryParams } from '../types';

function FilteredTasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskQueryParams>({
    completed: undefined,
    source: undefined,
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await tasksService.getTasks(filters);
        setTasks(response.tasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchTasks();
  }, [filters]);

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={filters.completed === true}
            onChange={(e) =>
              setFilters({
                ...filters,
                completed: e.target.checked ? true : undefined,
              })
            }
          />
          Show only completed
        </label>
        
        <select
          value={filters.source || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              source: e.target.value as any || undefined,
            })
          }
        >
          <option value="">All sources</option>
          <option value="manual">Manual tasks</option>
          <option value="google-classroom">Google Classroom</option>
        </select>
      </div>

      <div>
        {tasks.map((task) => (
          <div key={task.id}>{task.title}</div>
        ))}
      </div>
    </div>
  );
}
```

---

## Google Classroom

### Sync Google Classroom

```tsx
import { useState } from 'react';
import { classroomService } from '../services';

function SyncClassroomButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSync = async (forceRefresh = false) => {
    setSyncing(true);
    setResult('');

    try {
      const response = await classroomService.syncClassroom({ forceRefresh });
      setResult(
        `Synced ${response.assignmentsCount} assignments from ${response.coursesCount} courses. ${response.newAssignments} new assignments.`
      );
    } catch (err) {
      setResult('Sync failed');
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleSync(false)} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync Google Classroom'}
      </button>
      <button onClick={() => handleSync(true)} disabled={syncing}>
        Force Refresh
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}
```

### Display Courses

```tsx
import { useEffect, useState } from 'react';
import { classroomService } from '../services';
import type { GoogleClassroomCourse } from '../types';

function CoursesList() {
  const [courses, setCourses] = useState<GoogleClassroomCourse[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await classroomService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <h2>Your Courses</h2>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.name}</h3>
          {course.section && <p>Section: {course.section}</p>}
          {course.room && <p>Room: {course.room}</p>}
        </div>
      ))}
    </div>
  );
}
```

### Check Connection Status

```tsx
import { useEffect, useState } from 'react';
import { classroomService } from '../services';

function ClassroomStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    lastSyncedAt?: string;
    coursesCount?: number;
  } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await classroomService.getClassroomStatus();
        setStatus(data);
      } catch (err) {
        console.error('Failed to get status:', err);
      }
    };

    checkStatus();
  }, []);

  if (!status) return <div>Loading...</div>;

  return (
    <div>
      <p>Status: {status.connected ? 'Connected' : 'Not connected'}</p>
      {status.connected && (
        <>
          <p>Courses: {status.coursesCount}</p>
          <p>Last synced: {new Date(status.lastSyncedAt!).toLocaleString()}</p>
        </>
      )}
    </div>
  );
}
```

---

## Streaks

### Display Current Streak

```tsx
import { useEffect, useState } from 'react';
import { streaksService } from '../services';
import type { Streak } from '../types';

function StreakDisplay() {
  const [streak, setStreak] = useState<Streak | null>(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const data = await streaksService.getCurrentStreak();
        setStreak(data);
      } catch (err) {
        console.error('Failed to fetch streak:', err);
      }
    };

    fetchStreak();
  }, []);

  if (!streak) return <div>Loading...</div>;

  return (
    <div>
      <h2>🔥 {streak.currentStreak} Day Streak</h2>
      <p>Longest: {streak.longestStreak} days</p>
      <p>Total tasks completed: {streak.totalTasksCompleted}</p>
    </div>
  );
}
```

### Update Streak (When Task Completed)

```tsx
import { streaksService, tasksService } from '../services';

async function completeTaskAndUpdateStreak(taskId: string) {
  try {
    // Complete the task
    await tasksService.completeTask(taskId);

    // Update streak
    const updatedStreak = await streaksService.updateStreak({
      date: new Date().toISOString(),
      tasksCompleted: 1,
    });

    console.log('New streak:', updatedStreak.currentStreak);
  } catch (err) {
    console.error('Error:', err);
  }
}
```

### Streak History Chart

```tsx
import { useEffect, useState } from 'react';
import { streaksService } from '../services';
import type { StreakHistory } from '../types';

function StreakHistoryChart() {
  const [history, setHistory] = useState<StreakHistory[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Get last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const data = await streaksService.getStreakHistory({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h3>Last 30 Days</h3>
      {history.map((day) => (
        <div key={day.date}>
          <span>{new Date(day.date).toLocaleDateString()}</span>
          <span>Tasks: {day.tasksCompleted}</span>
          <span>Streak Day: {day.streakDay}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Badges & Achievements

### Display All Badges with Progress

```tsx
import { useEffect, useState } from 'react';
import { badgesService } from '../services';
import type { BadgeProgress } from '../types';

function BadgesGrid() {
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await badgesService.getBadgeProgress();
        setBadgeProgress(data);
      } catch (err) {
        console.error('Failed to fetch badges:', err);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {badgeProgress.map((progress) => (
        <div
          key={progress.badgeId}
          className={progress.isEarned ? 'opacity-100' : 'opacity-50'}
        >
          <div className="text-4xl">{progress.badge.icon}</div>
          <h3>{progress.badge.name}</h3>
          <p>{progress.badge.description}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#F5C842] h-2 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p>
            {progress.currentProgress} / {progress.required}
          </p>
          {progress.isEarned && <span>✓ Earned!</span>}
        </div>
      ))}
    </div>
  );
}
```

### Display Earned Badges

```tsx
import { useEffect, useState } from 'react';
import { badgesService } from '../services';
import type { UserBadge } from '../types';

function EarnedBadges() {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const badges = await badgesService.getUserBadges();
        const points = await badgesService.getTotalPoints();
        setUserBadges(badges);
        setTotalPoints(points);
      } catch (err) {
        console.error('Failed to fetch badges:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Your Badges ({userBadges.length})</h2>
      <p>Total Points: {totalPoints}</p>
      
      <div className="grid grid-cols-4 gap-4">
        {userBadges.map((userBadge) => (
          <div key={userBadge.id}>
            <div className="text-5xl">{userBadge.badge.icon}</div>
            <h4>{userBadge.badge.name}</h4>
            <p className="text-sm">+{userBadge.badge.points} pts</p>
            <p className="text-xs">
              Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Break Sessions

### Start Break Timer

```tsx
import { useState } from 'react';
import { breaksService } from '../services';
import type { BreakSession } from '../types';

function BreakTimerButton() {
  const [session, setSession] = useState<BreakSession | null>(null);
  const [canTake, setCanTake] = useState(true);
  const [message, setMessage] = useState('');

  const checkIfCanTakeBreak = async () => {
    try {
      const result = await breaksService.canTakeBreak();
      setCanTake(result.canTake);
      if (!result.canTake) {
        setMessage(result.reason || 'Cannot take break');
      }
    } catch (err) {
      console.error('Error checking break:', err);
    }
  };

  const startBreak = async () => {
    try {
      const response = await breaksService.startBreak({
        duration: 300, // 5 minutes in seconds
      });
      
      setSession(response.session);
      setMessage(`Break started! ${response.remainingBreaksToday} breaks remaining today.`);
    } catch (err: any) {
      setMessage(err.message || 'Failed to start break');
    }
  };

  const endBreak = async () => {
    if (!session) return;

    try {
      await breaksService.endBreak(session.id);
      setSession(null);
      setMessage('Break ended!');
    } catch (err) {
      console.error('Failed to end break:', err);
    }
  };

  return (
    <div>
      {!session ? (
        <>
          <button onClick={checkIfCanTakeBreak}>Check if can take break</button>
          <button onClick={startBreak} disabled={!canTake}>
            Start 5-Minute Break
          </button>
        </>
      ) : (
        <button onClick={endBreak}>End Break</button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
```

### Display Today's Break Stats

```tsx
import { useEffect, useState } from 'react';
import { breaksService } from '../services';

function TodayBreaksStats() {
  const [stats, setStats] = useState<{
    sessions: any[];
    remainingBreaks: number;
    totalBreakTime: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await breaksService.getTodayBreaks();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch break stats:', err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h3>Today's Breaks</h3>
      <p>Completed: {stats.sessions.length}</p>
      <p>Remaining: {stats.remainingBreaks}</p>
      <p>Total time: {Math.floor(stats.totalBreakTime / 60)} minutes</p>
    </div>
  );
}
```

---

## Settings

### Display and Update Settings

```tsx
import { useEffect, useState } from 'react';
import { settingsService } from '../services';
import type { UserSettings } from '../types';

function SettingsForm() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings(updates);
      setSettings(updated);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div>
      <h2>Settings</h2>

      <div>
        <label>
          Break Duration (minutes):
          <input
            type="number"
            value={settings.breakDuration}
            onChange={(e) =>
              handleUpdate({ breakDuration: parseInt(e.target.value) })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Max Breaks Per Day:
          <input
            type="number"
            value={settings.maxBreaksPerDay}
            onChange={(e) =>
              handleUpdate({ maxBreaksPerDay: parseInt(e.target.value) })
            }
          />
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) =>
              handleUpdate({ notificationsEnabled: e.target.checked })
            }
          />
          Enable Notifications
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.lockAppsEnabled}
            onChange={(e) =>
              handleUpdate({ lockAppsEnabled: e.target.checked })
            }
          />
          Enable App Locking
        </label>
      </div>

      {saving && <p>Saving...</p>}
    </div>
  );
}
```

---

## Error Handling

### Global Error Handler

```tsx
import type { ApiError } from '../types';

function handleApiError(error: unknown) {
  const apiError = error as ApiError;

  switch (apiError.statusCode) {
    case 401:
      // Unauthorized - redirect to login
      window.location.href = '/login';
      break;
    case 403:
      // Forbidden
      alert('You do not have permission to perform this action');
      break;
    case 404:
      // Not found
      alert('Resource not found');
      break;
    case 400:
      // Bad request
      alert(apiError.message || 'Invalid request');
      break;
    case 500:
      // Server error
      alert('Server error. Please try again later.');
      break;
    default:
      alert('An error occurred: ' + apiError.message);
  }
}

// Usage in component:
try {
  await tasksService.createTask(data);
} catch (error) {
  handleApiError(error);
}
```

### Retry Logic

```tsx
async function fetchWithRetry<T>(
  fetchFunction: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFunction();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

// Usage:
const tasks = await fetchWithRetry(() => tasksService.getTasksToday());
```

---

## Switching Between Mock and Real API

To switch from mock data to real backend:

1. Open `/src/app/services/config.ts`
2. Change `USE_MOCK_DATA: true` to `USE_MOCK_DATA: false`
3. Ensure your C# backend is running on `http://localhost:5000`

```typescript
// /src/app/services/config.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 30000,
  USE_MOCK_DATA: false, // ← Change this to false
};
```

All services will automatically switch to making real API calls!
