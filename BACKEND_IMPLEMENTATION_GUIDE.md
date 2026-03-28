# Study First - Backend Implementation Guide

This guide provides complete documentation for implementing the C# ASP.NET Core backend API for the Study First mobile app.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Database Configuration](#database-configuration)
3. [Google OAuth 2.0 Setup](#google-oauth-20-setup)
4. [Controllers Implementation](#controllers-implementation)
5. [Entity Models](#entity-models)
6. [Services](#services)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Endpoints Reference](#api-endpoints-reference)

---

## Project Setup

### Create ASP.NET Core Web API Project

```bash
# Create new ASP.NET Core Web API project
dotnet new webapi -n StudyFirst.API
cd StudyFirst.API

# Install required NuGet packages
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Authentication.Google
dotnet add package Google.Apis.Classroom.v1
dotnet add package Google.Apis.Auth
dotnet add package BCrypt.Net-Next
dotnet add package System.IdentityModel.Tokens.Jwt
```

### Project Structure

```
StudyFirst.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── TasksController.cs
│   ├── ClassroomController.cs
│   ├── StreaksController.cs
│   ├── BadgesController.cs
│   ├── BreaksController.cs
│   └── SettingsController.cs
├── Data/
│   ├── AppDbContext.cs
│   └── Migrations/
├── Models/
│   ├── User.cs
│   ├── Task.cs
│   ├── Streak.cs
│   ├── Badge.cs
│   ├── UserBadge.cs
│   ├── BreakSession.cs
│   └── UserSettings.cs
├── DTOs/
│   ├── Auth/
│   ├── Tasks/
│   ├── Classroom/
│   └── ...
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IGoogleClassroomService.cs
│   ├── GoogleClassroomService.cs
│   └── ...
├── Middleware/
│   └── ErrorHandlingMiddleware.cs
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

---

## Database Configuration

### AppDbContext.cs

```csharp
using Microsoft.EntityFrameworkCore;
using StudyFirst.API.Models;

namespace StudyFirst.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Models.Task> Tasks { get; set; }
        public DbSet<Streak> Streaks { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }
        public DbSet<BreakSession> BreakSessions { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.GoogleId);
                
                entity.HasOne(e => e.Streak)
                    .WithOne(s => s.User)
                    .HasForeignKey<Streak>(s => s.UserId);
                
                entity.HasOne(e => e.Settings)
                    .WithOne(s => s.User)
                    .HasForeignKey<UserSettings>(s => s.UserId);
            });

            // Task configuration
            modelBuilder.Entity<Models.Task>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.DueDate });
                
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Tasks)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Badge configuration
            modelBuilder.Entity<Badge>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            // UserBadge configuration
            modelBuilder.Entity<UserBadge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.BadgeId }).IsUnique();
                
                entity.HasOne(e => e.User)
                    .WithMany(u => u.UserBadges)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Badge)
                    .WithMany()
                    .HasForeignKey(e => e.BadgeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // BreakSession configuration
            modelBuilder.Entity<BreakSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.Date });
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed default badges
            SeedBadges(modelBuilder);
        }

        private void SeedBadges(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Badge>().HasData(
                new Badge
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                    Name = "First Steps",
                    Description = "Complete your first task",
                    Category = "tasks",
                    Icon = "🎯",
                    Requirement = 1,
                    Rarity = "common",
                    Points = 10
                },
                new Badge
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                    Name = "Week Warrior",
                    Description = "Maintain a 7-day streak",
                    Category = "streak",
                    Icon = "🔥",
                    Requirement = 7,
                    Rarity = "rare",
                    Points = 50
                },
                new Badge
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                    Name = "Perfect Month",
                    Description = "Maintain a 30-day streak",
                    Category = "streak",
                    Icon = "⭐",
                    Requirement = 30,
                    Rarity = "epic",
                    Points = 200
                },
                new Badge
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
                    Name = "Productivity Master",
                    Description = "Complete 100 tasks",
                    Category = "tasks",
                    Icon = "👑",
                    Requirement = 100,
                    Rarity = "epic",
                    Points = 150
                },
                new Badge
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000005"),
                    Name = "Focus Champion",
                    Description = "Complete 50 focus sessions",
                    Category = "focus",
                    Icon = "🎓",
                    Requirement = 50,
                    Rarity = "rare",
                    Points = 75
                },
                new Badge
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000006"),
                    Name = "Early Bird",
                    Description = "Complete a task before 8 AM",
                    Category = "special",
                    Icon = "🌅",
                    Requirement = 1,
                    Rarity = "common",
                    Points = 25
                }
            );
        }
    }
}
```

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=studyfirst.db"
  },
  "Jwt": {
    "SecretKey": "YOUR_SUPER_SECRET_KEY_HERE_CHANGE_THIS_IN_PRODUCTION",
    "Issuer": "StudyFirstAPI",
    "Audience": "StudyFirstApp",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
  "Google": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET",
    "RedirectUri": "http://localhost:5000/api/auth/google/callback"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173"
    ]
  }
}
```

---

## Entity Models

### Models/User.cs

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudyFirst.API.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        public string? PasswordHash { get; set; }

        [MaxLength(500)]
        public string? ProfilePicture { get; set; }

        [MaxLength(255)]
        public string? GoogleId { get; set; }

        public string? GoogleRefreshToken { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastLogin { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
        public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
        public virtual Streak? Streak { get; set; }
        public virtual UserSettings? Settings { get; set; }
    }
}
```

### Models/Task.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyFirst.API.Models
{
    public class Task
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Class { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [MaxLength(20)]
        public string? DueTime { get; set; }

        public bool Completed { get; set; } = false;

        [Required]
        [MaxLength(50)]
        public string Source { get; set; } = "manual"; // "manual" or "google-classroom"

        public int? Points { get; set; }

        public string? Attachments { get; set; } // JSON array

        [MaxLength(255)]
        public string? GoogleClassroomId { get; set; }

        [MaxLength(255)]
        public string? CourseId { get; set; }

        [MaxLength(255)]
        public string? CourseName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
```

### Models/Streak.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyFirst.API.Models
{
    public class Streak
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public int CurrentStreak { get; set; } = 0;
        public int LongestStreak { get; set; } = 0;
        public DateTime? LastCompletedDate { get; set; }
        public int TotalTasksCompleted { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
```

### Models/Badge.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace StudyFirst.API.Models
{
    public class Badge
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // "streak", "tasks", "focus", "special"

        [Required]
        [MaxLength(10)]
        public string Icon { get; set; } = string.Empty;

        [Required]
        public int Requirement { get; set; }

        [Required]
        [MaxLength(20)]
        public string Rarity { get; set; } = "common"; // "common", "rare", "epic", "legendary"

        [Required]
        public int Points { get; set; }
    }
}
```

### Models/UserBadge.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyFirst.API.Models
{
    public class UserBadge
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid BadgeId { get; set; }

        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

        public int? Progress { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("BadgeId")]
        public virtual Badge Badge { get; set; } = null!;
    }
}
```

### Models/BreakSession.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyFirst.API.Models
{
    public class BreakSession
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [Required]
        public int Duration { get; set; } // in seconds

        public bool Completed { get; set; } = false;

        [Required]
        public DateTime Date { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
```

### Models/UserSettings.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyFirst.API.Models
{
    public class UserSettings
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public int BreakDuration { get; set; } = 5; // minutes
        public int MaxBreaksPerDay { get; set; } = 6;
        public int BreakIntervalMinutes { get; set; } = 30;
        public bool NotificationsEnabled { get; set; } = true;
        public bool LockAppsEnabled { get; set; } = true;
        public string LockedApps { get; set; } = "[]"; // JSON array

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
```

---

## Google OAuth 2.0 Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Study First"
3. Enable Google Classroom API
4. Enable Google+ API (for user info)

### Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in app information:
   - App name: "Study First"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`

### Step 3: Create OAuth 2.0 Credentials

1. Go to "Credentials" > "Create Credentials" > "OAuth client ID"
2. Application type: "Web application"
3. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - Your production callback URL
4. Copy Client ID and Client Secret to appsettings.json

### Services/GoogleClassroomService.cs

```csharp
using Google.Apis.Auth.OAuth2;
using Google.Apis.Classroom.v1;
using Google.Apis.Classroom.v1.Data;
using Google.Apis.Services;
using StudyFirst.API.Data;

namespace StudyFirst.API.Services
{
    public interface IGoogleClassroomService
    {
        Task<List<Course>> GetCoursesAsync(string accessToken);
        Task<List<CourseWork>> GetCourseWorkAsync(string accessToken, string courseId);
    }

    public class GoogleClassroomService : IGoogleClassroomService
    {
        public async Task<List<Course>> GetCoursesAsync(string accessToken)
        {
            var credential = GoogleCredential.FromAccessToken(accessToken);
            var service = new ClassroomService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "Study First"
            });

            var request = service.Courses.List();
            request.CourseStates = CoursesResource.ListRequest.CourseStatesEnum.ACTIVE;
            
            var response = await request.ExecuteAsync();
            return response.Courses?.ToList() ?? new List<Course>();
        }

        public async Task<List<CourseWork>> GetCourseWorkAsync(string accessToken, string courseId)
        {
            var credential = GoogleCredential.FromAccessToken(accessToken);
            var service = new ClassroomService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "Study First"
            });

            var request = service.Courses.CourseWork.List(courseId);
            var response = await request.ExecuteAsync();
            return response.CourseWork?.ToList() ?? new List<CourseWork>();
        }
    }
}
```

---

## Program.cs Configuration

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudyFirst.API.Data;
using StudyFirst.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IGoogleClassroomService, GoogleClassroomService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
```

---

## API Endpoints Reference

All endpoints use base URL: `http://localhost:5000/api`

### Authentication Endpoints

- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/google` - Authenticate with Google
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Tasks Endpoints

- `GET /tasks` - Get all tasks (with filters)
- `GET /tasks/today` - Get tasks due today
- `GET /tasks/upcoming` - Get upcoming tasks
- `GET /tasks/{id}` - Get task by ID
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `POST /tasks/{id}/complete` - Mark task as complete
- `POST /tasks/{id}/uncomplete` - Mark task as incomplete

### Google Classroom Endpoints

- `POST /classroom/sync` - Sync Google Classroom data
- `GET /classroom/courses` - Get all courses
- `GET /classroom/assignments` - Get all assignments
- `GET /classroom/assignments/{id}` - Get assignment by ID
- `GET /classroom/connect` - Get Google OAuth URL
- `POST /classroom/disconnect` - Disconnect Google Classroom
- `GET /classroom/status` - Get connection status

### Streaks Endpoints

- `GET /streaks/current` - Get current streak
- `GET /streaks/history` - Get streak history
- `POST /streaks/update` - Update streak

### Badges Endpoints

- `GET /badges` - Get all badges
- `GET /badges/user` - Get user's earned badges
- `GET /badges/progress` - Get badge progress
- `GET /badges/{id}` - Get badge by ID

### Break Sessions Endpoints

- `POST /breaks/start` - Start break session
- `POST /breaks/{id}/end` - End break session
- `GET /breaks/today` - Get today's breaks
- `GET /breaks` - Get all break sessions

### Settings Endpoints

- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings

---

## Running Migrations

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update

# Run the API
dotnet run
```

---

## Testing the API

The frontend is already configured with mock data. To test with real backend:

1. Start the C# backend: `dotnet run`
2. In the frontend, set `USE_MOCK_DATA: false` in `/src/app/services/config.ts`
3. Ensure backend runs on `http://localhost:5000`

---

## Security Considerations

1. **Change JWT Secret**: Update `Jwt:SecretKey` in production
2. **Use HTTPS**: Enable HTTPS for production
3. **Secure Google Credentials**: Never commit credentials to version control
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs
6. **SQL Injection**: EF Core protects against this, but always use parameterized queries

---

## Next Steps

1. Implement all controller actions
2. Add comprehensive error handling
3. Implement Google Classroom sync background job
4. Add logging with Serilog
5. Implement badge awarding logic
6. Add unit tests
7. Deploy to Azure/AWS

For the .NET MAUI Android wrapper, create a separate project and follow the .NET MAUI WebView documentation.
