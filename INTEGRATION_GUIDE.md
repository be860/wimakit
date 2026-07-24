# Frontend-Backend Integration Guide

This guide explains how to connect the WiMakit Next.js frontend with your ASP.NET Web API backend.

## Backend Setup

### 1. Open the Backend Project

Navigate to the `backend/WiMakit.API` directory and open the solution in Visual Studio 2022 or VS Code.

### 2. Configure Database Connection

Update `appsettings.json` with your SQL Server connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=WiMakit;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### 3. Create Database

Run the SQL scripts in order:
1. Open SQL Server Management Studio or Azure Data Studio
2. Execute `Database/01_CreateTables.sql`
3. Execute `Database/02_SeedData.sql`

**OR** use Entity Framework migrations:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Run the Backend API

```bash
cd backend/WiMakit.API
dotnet restore
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:7001`
- Swagger UI: `https://localhost:7001/swagger`

## Frontend Setup

### 1. Configure API URL

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing the Integration

### 1. Register a New User

1. Go to `http://localhost:3000/register`
2. Fill in the registration form
3. Check the backend console for the verification token (since email is not configured yet)
4. Use the token to verify the email manually via API or database

### 2. Login

1. Go to `http://localhost:3000/login`
2. Login with your credentials
3. You'll be redirected to your dashboard based on your role

### 3. Test Produce Management (Farmer)

1. Login as a farmer
2. Add new produce from the dashboard
3. View, edit, or delete your produce listings

### 4. Test Browse & Messaging (Buyer)

1. Login as a buyer
2. Browse available produce
3. Send messages to farmers
4. View conversations

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address

### Produce
- `GET /api/produce` - Get all produce (with optional filters)
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

## Authentication Flow

1. User registers → Backend creates user with verification token
2. User verifies email → Backend marks email as verified
3. User logs in → Backend returns JWT token
4. Frontend stores token in localStorage
5. All subsequent API calls include token in Authorization header

## CORS Configuration

The backend is configured to allow requests from `http://localhost:3000` and `https://localhost:3000`.

For production, update the CORS policy in `Program.cs`:

```csharp
policy.WithOrigins("https://your-production-domain.com")
