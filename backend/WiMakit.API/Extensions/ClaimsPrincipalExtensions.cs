using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace WiMakit.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        /// <summary>
        /// Reads the authenticated user id from JWT claims.
        /// Supports both .NET 8 default claim names (sub) and legacy NameIdentifier mapping.
        /// </summary>
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var raw = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                   ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? user.FindFirst("sub")?.Value;

            return int.TryParse(raw, out var userId) ? userId : 0;
        }
    }
}
