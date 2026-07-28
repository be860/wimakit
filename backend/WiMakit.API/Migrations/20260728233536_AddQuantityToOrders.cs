using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WiMakit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Orders");
        }
    }
}
