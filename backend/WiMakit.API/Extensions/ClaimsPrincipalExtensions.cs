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

        /// <summary>
        /// Checks whether the user holds any of the given roles, ignoring case.
        /// ASP.NET Core's built-in [Authorize(Roles=...)] compares the claim VALUE
        /// case-sensitively (see https://github.com/dotnet/aspnetcore/issues/44713),
        /// which silently breaks role checks whenever a role is stored/issued with
        /// inconsistent casing (e.g. "SuperAdmin" vs "superadmin"). This performs
        /// the comparison case-insensitively instead, so token/DB casing never matters.
        /// </summary>
        public static bool HasAnyRole(this ClaimsPrincipal user, params string[] roles)
        {
            // Program.cs sets MapInboundClaims = false and RoleClaimType = "role", so the
            // JWT's role claims keep the short "role" type rather than being remapped to
            // the long ClaimTypes.Role URI. Match on the identity's own RoleClaimType
            // (falling back to "role") so this stays correct even if that config changes.
            var roleClaimType = (user.Identity as ClaimsIdentity)?.RoleClaimType ?? "role";
            var roleClaims = user.FindAll(roleClaimType).Select(c => c.Value);

            return roleClaims.Any(claimRole =>
                roles.Any(role => string.Equals(claimRole, role, StringComparison.OrdinalIgnoreCase)));
        }
    }
}
