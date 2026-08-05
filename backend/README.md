# WiMakit Backend API

ASP.NET Core Web API backend for the WiMakit platform.

## Prerequisites

- .NET 8.0 SDK
- SQL Server (LocalDB or Express)
- Visual Studio 2022 or VS Code

## Setup Instructions

### 1. Database Setup

1. Update the connection string in `appsettings.json` to match your SQL Server instance
2. Run the SQL scripts in order:
   ```bash
   # In SQL Server Management Studio or Azure Data Studio
   # Run: Database/01_CreateTables.sql
   # Run: Database/02_SeedData.sql
   ```

### 2. Entity Framework Migrations (Alternative to SQL Scripts)

If you prefer to use EF Core migrations instead of running SQL scripts:

```bash
# Install EF Core tools
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### 3. Configuration

Update `appsettings.json`:
- Set your SQL Server connection string
- Update JWT settings (change the secret key in production!)

### 4. Install Dependencies

```bash
dotnet restore
```

### 5. Run the API

```bash
dotnet run
```

The API will be available at:
- HTTPS: https://localhost:7001
- HTTP: http://localhost:5000
- Swagger: https://localhost:7001/swagger

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address

### Produce
- `GET /api/produce` - Get all produce (with optional search & category filters)
- `GET /api/produce/{id}` - Get produce by ID
- `GET /api/produce/farmer/{farmerId}` - Get farmer's produce
- `POST /api/produce` - Create new produce (Farmer only)
- `PUT /api/produce/{id}` - Update produce (Farmer only)
- `DELETE /api/produce/{id}` - Delete produce (Farmer only)

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/{otherUserId}` - Get messages with specific user
- `POST /api/messages` - Send message
- `PUT /api/messages/{id}/read` - Mark message as read

## Authentication

The API uses JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-token-here}
```

## CORS Configuration

Update the CORS policy in `Program.cs` to match your frontend URL:

```csharp
policy.WithOrigins("http://localhost:3000", "https://your-production-url.com")
