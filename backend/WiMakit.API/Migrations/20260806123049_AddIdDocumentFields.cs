using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WiMakit.API.Migrations
{
    /// <inheritdoc />
    public partial class AddIdDocumentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdDocumentBackUrl",
                table: "Users",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdDocumentFrontUrl",
                table: "Users",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdDocumentType",
                table: "Users",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdDocumentBackUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IdDocumentFrontUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IdDocumentType",
                table: "Users");
        }
    }
}
