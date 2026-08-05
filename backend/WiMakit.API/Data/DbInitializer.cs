using WiMakit.API.Models;

namespace WiMakit.API.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            // Seed SuperAdmin if no SuperAdmin user exists
            if (!context.Users.Any(u => u.Role == "SuperAdmin"))
            {
                var seedEmail = Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL");
                if (string.IsNullOrWhiteSpace(seedEmail)) seedEmail = "primedevs03@gmail.com";

                var seedPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");
                if (string.IsNullOrWhiteSpace(seedPassword)) seedPassword = "Admin@2026";

                var admin = new User
                {
                    FirstName = "Super",
                    LastName = "Admin",
                    Email = seedEmail.Trim().ToLowerInvariant(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedPassword),
                    Role = "SuperAdmin",
                    Phone = "+232 76 000000",
                    Location = "Waterloo",
                    District = "Western Area Rural",
                    IsEmailVerified = true,
                    MustChangePassword = true,
                    VerificationStatus = "Approved",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(admin);
                await context.SaveChangesAsync();

                context.AuditLogs.Add(new AuditLog
                {
                    AdminId = admin.Id,
                    AdminName = admin.FullName,
                    Action = "SuperAdminSeeded",
                    TargetType = "User",
                    TargetId = admin.Id.ToString(),
                    Details = $"SuperAdmin initial account seeded for {admin.Email} from environment variables.",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Seed Farmer Demo Account
            if (!context.Users.Any(u => u.Email == "farmer.demo@wimakit.sl"))
            {
                var farmer = new User
                {
                    FirstName = "Mohamed",
                    LastName = "Kamara",
                    Email = "farmer.demo@wimakit.sl",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Farmer123!"),
                    Role = "farmer",
                    Phone = "+232 76 111222",
                    Location = "Bo District",
                    District = "Bo",
                    Chiefdom = "Kakua",
                    FarmName = "Kamara Organic Farms",
                    FarmSize = "5–20 acres",
                    FarmingExperience = "5+ years",
                    IsEmailVerified = true,
                    VerificationStatus = "Approved",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(farmer);
            }

            // Seed Buyer Demo Account
            if (!context.Users.Any(u => u.Email == "buyer.demo@wimakit.sl"))
            {
                var buyer = new User
                {
                    FirstName = "Freetown",
                    LastName = "Fresh Ltd",
                    Email = "buyer.demo@wimakit.sl",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer123!"),
                    Role = "buyer",
                    Phone = "+232 78 333444",
                    Location = "Freetown",
                    District = "Western Area Urban",
                    BusinessName = "Freetown Produce Market",
                    BusinessType = "Wholesaler",
                    IsEmailVerified = true,
                    VerificationStatus = "Approved",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(buyer);
            }

            await context.SaveChangesAsync();
        }
    }
}
