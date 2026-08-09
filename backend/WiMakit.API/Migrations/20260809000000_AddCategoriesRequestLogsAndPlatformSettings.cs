using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WiMakit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoriesRequestLogsAndPlatformSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Commission = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Slug",
                table: "Categories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateTable(
                name: "RequestLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Method = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Path = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    QueryString = table.Column<string>(type: "text", nullable: true),
                    StatusCode = table.Column<int>(type: "integer", nullable: false),
                    DurationMs = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    UserEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UserRole = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RequestLogs_CreatedAt",
                table: "RequestLogs",
                column: "CreatedAt");

            migrationBuilder.CreateTable(
                name: "PlatformSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    PlatformName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SupportEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DisplayCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    BaseCommission = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    PayoutSchedule = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ManualReviewThreshold = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RequireNinVerification = table.Column<bool>(type: "boolean", nullable: false),
                    AutoHoldHighValueOrders = table.Column<bool>(type: "boolean", nullable: false),
                    RequireTwoFactorForStaff = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformSettings", x => x.Id);
                });

            // Seed the single settings row with sane defaults so GET never 404s before the first Save.
            migrationBuilder.InsertData(
                table: "PlatformSettings",
                columns: new[]
                {
                    "Id", "PlatformName", "SupportEmail", "DisplayCurrency", "BaseCommission",
                    "PayoutSchedule", "ManualReviewThreshold", "RequireNinVerification",
                    "AutoHoldHighValueOrders", "RequireTwoFactorForStaff", "UpdatedAt", "UpdatedBy"
                },
                values: new object[]
                {
                    1, "WiMakit", "support@wimakit.sl", "sll", 3.5m,
                    "weekly", 10000000m, true,
                    true, false, null, null
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Categories");
            migrationBuilder.DropTable(name: "RequestLogs");
            migrationBuilder.DropTable(name: "PlatformSettings");
        }
    }
}
