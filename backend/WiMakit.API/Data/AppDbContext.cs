using Microsoft.EntityFrameworkCore;
using WiMakit.API.Models;

namespace WiMakit.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Produce> Produces { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<FraudCase> FraudCases { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configure Produce relationships
            modelBuilder.Entity<Produce>()
                .HasOne(p => p.Farmer)
                .WithMany(u => u.Produces)
                .HasForeignKey(p => p.FarmerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Message relationships
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Produce)
                .WithMany()
                .HasForeignKey(m => m.ProduceId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Order relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Buyer)
                .WithMany()
                .HasForeignKey(o => o.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Farmer)
                .WithMany()
                .HasForeignKey(o => o.FarmerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Produce)
                .WithMany()
                .HasForeignKey(o => o.ProduceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure RefreshToken relationships
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Review relationships
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Farmer)
                .WithMany()
                .HasForeignKey(r => r.FarmerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Buyer)
                .WithMany()
                .HasForeignKey(r => r.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure FraudCase relationships
            modelBuilder.Entity<FraudCase>()
                .HasOne(fc => fc.Buyer)
                .WithMany()
                .HasForeignKey(fc => fc.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FraudCase>()
                .HasOne(fc => fc.Farmer)
                .WithMany()
                .HasForeignKey(fc => fc.FarmerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
