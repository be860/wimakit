using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WiMakit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "NotifyNewOrders",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyListingApprovals",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyMessages",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyBroadcasts",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotifyNewOrders",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NotifyListingApprovals",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NotifyMessages",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NotifyBroadcasts",
                table: "Users");
        }
    }
}
