using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using WiMakit.API.Data;
using WiMakit.API.Extensions;
using WiMakit.API.Models;

namespace WiMakit.API.Middleware
{
    /// <summary>
    /// Logs every API request to RequestLogs — method, path, status, duration,
    /// caller identity (if authenticated), and IP. This is the full system audit
    /// trail (every request from any user), distinct from AuditLog, which only
    /// records curated privileged admin actions.
    ///
    /// Health checks, Swagger, and static files are skipped to keep the table
    /// signal-heavy — everything under /api is captured regardless of outcome
    /// or role, including failed/unauthorized attempts.
    /// </summary>
    public class RequestAuditMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestAuditMiddleware> _logger;

        private static readonly string[] SkippedPrefixes = { "/health", "/swagger", "/images", "/favicon" };

        public RequestAuditMiddleware(RequestDelegate next, ILogger<RequestAuditMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
        {
            var path = context.Request.Path.Value ?? string.Empty;
            var shouldLog = !SkippedPrefixes.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase));

            if (!shouldLog)
            {
                await _next(context);
                return;
            }

            var stopwatch = Stopwatch.StartNew();
            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();

                try
                {
                    var isAuthenticated = context.User?.Identity?.IsAuthenticated == true;
                    int? userId = isAuthenticated ? context.User!.GetUserId() : null;
                    if (userId == 0) userId = null;

                    dbContext.RequestLogs.Add(new RequestLog
                    {
                        Method = context.Request.Method,
                        Path = path.Length > 300 ? path[..300] : path,
                        QueryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null,
                        StatusCode = context.Response.StatusCode,
                        DurationMs = stopwatch.ElapsedMilliseconds,
                        UserId = userId,
                        UserEmail = context.User?.FindFirst(JwtRegisteredClaimNames.Email)?.Value,
                        UserRole = context.User?.FindFirst("role")?.Value,
                        IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                        UserAgent = context.Request.Headers.UserAgent.ToString() is { Length: > 0 } ua
                            ? (ua.Length > 300 ? ua[..300] : ua)
                            : null,
                        CreatedAt = DateTime.UtcNow
                    });

                    await dbContext.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    // Never let audit logging break the actual request.
                    _logger.LogWarning(ex, "Failed to write request audit log for {Method} {Path}", context.Request.Method, path);
                }
            }
        }
    }
}
