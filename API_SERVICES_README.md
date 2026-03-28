# Study First - API Services Documentation

Complete TypeScript API service layer for the Study First mobile app, ready to connect to a C# ASP.NET Core backend.

## 📁 Project Structure

```
/src/app/
├── types/
│   └── index.ts                 # TypeScript interfaces for all data models
├── services/
│   ├── config.ts                # API configuration and endpoints
│   ├── api-client.ts            # Base HTTP client with auth handling
│   ├── mock-data.ts             # Mock data for development
│   ├── auth.service.ts          # Authentication service
│   ├── tasks.service.ts         # Tasks management
│   ├── classroom.service.ts     # Google Classroom integration
│   ├── streaks.service.ts       # Streak tracking
│   ├── badges.service.ts        # Badges and achievements
│   ├── breaks.service.ts        # Break timer sessions
│   ├── settings.service.ts      # User settings
│   └── index.ts                 # Export all services
```

## 🚀 Quick Start

### 1. Import Services in Your Component

```typescript
import { tasksService, authService, streaksService } from '../services';
import type { Task, User, Streak } from '../types';
```

### 2. Use Services (Currently with Mock Data)

```typescript
// Get today's tasks
const tasks = await tasksService.getTasksToday();

// Login user
const response = await authService.login({ email, password });

// Get current streak
const streak = await streaksService.getCurrentStreak();
```

### 3. Switch to Real Backend (When Ready)

Open `/src/app/services/config.ts` and change:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 30000,
  USE_MOCK_DATA: false, // ← Change to false
};
```

## 📚 Available Services

### 🔐 Auth Service

```typescript
import { authService } from '../services';

// Login
await authService.login({ email, password });

// Register
await authService.register({ email, password, name });

// Google OAuth
await authService.googleAuth({ code, redirectUri });

// Get current user
const user = await authService.getCurrentUser();

// Logout
await authService.logout();

// Check if authenticated
const isAuth = authService.isAuthenticated();
```

### ✅ Tasks Service

```typescript
import { tasksService } from '../services';

// Get all tasks (with filters)
const response = await tasksService.getTasks({
  completed: false,
  source: 'manual',
  startDate: '2026-03-01',
  endDate: '2026-03-31',
});

// Get today's tasks
const todayTasks = await tasksService.getTasksToday();

// Get upcoming tasks
const upcoming = await tasksService.getUpcomingTasks();

// Create task
const newTask = await tasksService.createTask({
  title: 'Study for exam',
  description: 'Chapter 5-7',
  class: 'Math',
  dueDate: '2026-03-26',
  dueTime: '11:59 PM',
});

// Update task
await tasksService.updateTask(taskId, { title: 'New title' });

// Complete task (manual tasks only)
await tasksService.completeTask(taskId);

// Delete task
await tasksService.deleteTask(taskId);
```

### 📚 Google Classroom Service

```typescript
import { classroomService } from '../services';

// Sync Google Classroom
const result = await classroomService.syncClassroom({ forceRefresh: false });

// Get courses
const courses = await classroomService.getCourses();

// Get assignments
const assignments = await classroomService.getAssignments();

// Get connection status
const status = await classroomService.getClassroomStatus();

// Connect to Google Classroom
const { authUrl } = await classroomService.connectClassroom();

// Disconnect
await classroomService.disconnectClassroom();
```

### 🔥 Streaks Service

```typescript
import { streaksService } from '../services';

// Get current streak
const streak = await streaksService.getCurrentStreak();

// Get streak history
const history = await streaksService.getStreakHistory({
  startDate: '2026-02-01',
  endDate: '2026-03-01',
});

// Update streak (called when task completed)
const updated = await streaksService.updateStreak({
  date: new Date().toISOString(),
  tasksCompleted: 1,
});
```

### 🏆 Badges Service

```typescript
import { badgesService } from '../services';

// Get all badges
const allBadges = await badgesService.getAllBadges();

// Get user's earned badges
const earnedBadges = await badgesService.getUserBadges();

// Get badge progress for all badges
const progress = await badgesService.getBadgeProgress();

// Get total points
const points = await badgesService.getTotalPoints();

// Get badges by category
const streakBadges = await badgesService.getBadgesByCategory('streak');

// Get recently earned badges
const recent = await badgesService.getRecentlyEarnedBadges();
```

### ⏱️ Breaks Service

```typescript
import { breaksService } from '../services';

// Check if user can take a break
const canTake = await breaksService.canTakeBreak();

// Start break
const result = await breaksService.startBreak({
  duration: 300, // 5 minutes in seconds
});

// End break
await breaksService.endBreak(sessionId);

// Get today's breaks
const todayBreaks = await breaksService.getTodayBreaks();

// Get all breaks
const allBreaks = await breaksService.getAllBreaks();
```

### ⚙️ Settings Service

```typescript
import { settingsService } from '../services';

// Get settings
const settings = await settingsService.getSettings();

// Update settings
await settingsService.updateSettings({
  breakDuration: 5,
  maxBreaksPerDay: 6,
  notificationsEnabled: true,
});

// Add locked app
await settingsService.addLockedApp('Instagram');

// Remove locked app
await settingsService.removeLockedApp('Instagram');

// Toggle app lock
await settingsService.toggleAppLock(true);

// Reset to defaults
await settingsService.resetToDefaults();
```

## 🔧 Configuration

### API Endpoints

All endpoints are defined in `/src/app/services/config.ts`:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE_AUTH: '/auth/google',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    TODAY: '/tasks/today',
    UPCOMING: '/tasks/upcoming',
    COMPLETE: (id: string) => `/tasks/${id}/complete`,
  },
  // ... more endpoints
};
```

### Environment Configuration

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api', // Change for production
  TIMEOUT: 30000, // 30 seconds
  USE_MOCK_DATA: true, // Set to false when backend is ready
};
```

## 🔒 Authentication

All services automatically handle authentication:

1. **Access Token**: Stored in `localStorage` as `study_first_token`
2. **Refresh Token**: Stored in `localStorage` as `study_first_refresh_token`
3. **Auto Headers**: All requests automatically include `Authorization: Bearer {token}` header

### Manual Token Management

```typescript
import { apiClient } from '../services/api-client';

// Set tokens
apiClient.setTokens(accessToken, refreshToken);

// Clear tokens
apiClient.clearTokens();
```

## ❌ Error Handling

All services throw `ApiError` type on failures:

```typescript
import type { ApiError } from '../types';

try {
  const tasks = await tasksService.getTasksToday();
} catch (err) {
  const error = err as ApiError;
  console.log(error.message);     // User-friendly message
  console.log(error.statusCode);  // HTTP status code
  console.log(error.error);       // Error code
  console.log(error.details);     // Additional details
}
```

### Common Error Codes

- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `400` - Bad Request
- `500` - Server Error
- `408` - Request Timeout

## 📦 TypeScript Types

All types are exported from `/src/app/types/index.ts`:

```typescript
import type {
  User,
  Task,
  Streak,
  Badge,
  UserBadge,
  BreakSession,
  UserSettings,
  GoogleClassroomCourse,
  GoogleClassroomAssignment,
  ApiError,
  ApiResponse,
} from '../types';
```

## 🎭 Mock Data

Currently using mock data for development. All mock data is in `/src/app/services/mock-data.ts`:

- **mockUser**: Sample user account
- **mockTasks**: Array of sample tasks
- **mockStreak**: Sample streak data
- **mockBadges**: All available badges
- **mockUserBadges**: Earned badges
- **mockSettings**: User settings
- **mockBreakSessions**: Break session history
- **mockCourses**: Google Classroom courses
- **mockClassroomAssignments**: Google Classroom assignments

## 🔄 API Client Features

The base API client (`api-client.ts`) provides:

- ✅ **Automatic Authorization**: JWT tokens automatically added to headers
- ✅ **Request Timeout**: 30-second timeout on all requests
- ✅ **Error Handling**: Consistent error format
- ✅ **Type Safety**: Full TypeScript support
- ✅ **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- ✅ **Query Parameters**: Automatic URL encoding

### Making Custom API Calls

```typescript
import { apiClient } from '../services/api-client';

// GET request
const response = await apiClient.get<User>('/users/me');

// POST request
const created = await apiClient.post<Task>('/tasks', {
  title: 'New task',
  dueDate: '2026-03-26',
});

// PUT request
const updated = await apiClient.put<Task>('/tasks/123', {
  title: 'Updated title',
});

// DELETE request
await apiClient.delete('/tasks/123');
```

## 🔗 Backend Integration

### C# Backend Requirements

Your C# ASP.NET Core backend should:

1. **Base URL**: Run on `http://localhost:5000`
2. **CORS**: Allow requests from frontend origin
3. **JWT Auth**: Use Bearer token authentication
4. **Response Format**: Return data in `ApiResponse<T>` format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

5. **Error Format**: Return errors as:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "User-friendly message",
  "statusCode": 400
}
```

### Testing Backend Connection

1. Start your C# backend on `http://localhost:5000`
2. Set `USE_MOCK_DATA: false` in `config.ts`
3. Try a simple request:

```typescript
import { authService } from '../services';

try {
  const user = await authService.getCurrentUser();
  console.log('Backend connected!', user);
} catch (err) {
  console.error('Backend error:', err);
}
```

## 📖 Additional Documentation

- **[Backend Implementation Guide](./BACKEND_IMPLEMENTATION_GUIDE.md)**: Complete C# backend setup
- **[API Usage Examples](./API_USAGE_EXAMPLES.md)**: React component examples

## 🎯 Next Steps

1. ✅ **Frontend API layer** - Complete (you are here!)
2. ⏳ **Build C# Backend** - Follow `BACKEND_IMPLEMENTATION_GUIDE.md`
3. ⏳ **Connect Services** - Set `USE_MOCK_DATA: false`
4. ⏳ **Test Integration** - Verify all endpoints work
5. ⏳ **Deploy Backend** - Azure/AWS deployment
6. ⏳ **Update BASE_URL** - Point to production backend
7. ⏳ **Build Mobile App** - .NET MAUI WebView wrapper

## 💡 Tips

- **Development**: Keep `USE_MOCK_DATA: true` to work without backend
- **Testing**: Use mock data to test UI without API calls
- **Error Handling**: Always wrap service calls in try-catch
- **Type Safety**: Import types from `../types` for autocomplete
- **Performance**: Services include realistic delays to simulate network

## 🐛 Troubleshooting

### "Network Error" / "CORS Error"

1. Ensure backend is running on `http://localhost:5000`
2. Check backend CORS configuration
3. Verify `BASE_URL` in `config.ts`

### "Unauthorized" (401)

1. Check if user is logged in: `authService.isAuthenticated()`
2. Verify JWT token in localStorage: `study_first_token`
3. Try logging in again

### Types Not Found

```typescript
// ❌ Wrong
import { Task } from '../services';

// ✅ Correct
import type { Task } from '../types';
```

## 📞 Support

All services are fully typed and documented. Use TypeScript autocomplete (Ctrl+Space) to discover available methods and parameters.

---

**Happy coding! 🚀**
