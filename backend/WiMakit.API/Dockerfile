# ── Stage 1: Build ────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the csproj first and restore separately so Docker can cache this layer
# and skip re-downloading packages when only source files change.
COPY WiMakit.API.csproj ./
RUN dotnet restore "WiMakit.API.csproj"

# Copy everything else and publish
COPY . .
RUN dotnet publish "WiMakit.API.csproj" -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Run as a non-root user (security best practice)
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

COPY --from=build /app/publish .
RUN chown -R appuser:appgroup /app
USER appuser

# Informational only — Render assigns the actual port via the $PORT env var,
# which Program.cs already reads (builder.WebHost.UseUrls($"http://+:{port}")).
EXPOSE 8080

ENTRYPOINT ["dotnet", "WiMakit.API.dll"]
