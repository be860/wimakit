using System.Net.Http.Headers;

namespace WiMakit.API.Services
{
    public interface IFileStorageService
    {
        /// <summary>
        /// Uploads a file to cloud storage in the default bucket and returns its public URL, or null on failure.
        /// </summary>
        Task<string?> UploadImageAsync(IFormFile file);

        /// <summary>
        /// Uploads a file to a specific cloud storage bucket and returns its public URL, or null on failure.
        /// </summary>
        Task<string?> UploadImageAsync(IFormFile file, string targetBucket);
    }

    /// <summary>
    /// Uploads images to Supabase Storage via its REST API.
    /// Chosen because this project already uses Supabase for Postgres — no new
    /// third-party account is required. Swap this implementation out if you'd
    /// rather use S3, Cloudinary, etc.
    ///
    /// Required setup in your Supabase project:
    ///   1. Storage -> Create a new bucket (e.g. "produce-images") and mark it Public.
    ///   2. Config: Supabase:Url            = https://YOUR-PROJECT.supabase.co
    ///              Supabase:ServiceRoleKey = your project's service_role key (NOT the anon key)
    ///              Supabase:Bucket         = produce-images
    ///
    /// The service_role key bypasses Row Level Security and can write to storage,
    /// so treat it exactly like the DB password: env var / Render secret only,
    /// never committed to source control.
    /// </summary>
    public class SupabaseStorageService : IFileStorageService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SupabaseStorageService> _logger;

        public SupabaseStorageService(HttpClient httpClient, IConfiguration configuration, ILogger<SupabaseStorageService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public Task<string?> UploadImageAsync(IFormFile file)
        {
            var defaultBucket = _configuration["Supabase:Bucket"];
            return UploadImageAsync(file, defaultBucket ?? "produce-images");
        }

        public async Task<string?> UploadImageAsync(IFormFile file, string targetBucket)
        {
            var supabaseUrl = _configuration["Supabase:Url"]?.TrimEnd('/');
            var serviceRoleKey = _configuration["Supabase:ServiceRoleKey"];

            if (string.IsNullOrWhiteSpace(supabaseUrl) || string.IsNullOrWhiteSpace(serviceRoleKey) || string.IsNullOrWhiteSpace(targetBucket))
            {
                _logger.LogError("Supabase:Url, Supabase:ServiceRoleKey, or target bucket is not configured. Cannot upload image.");
                return null;
            }

            try
            {
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var fileName = $"{Guid.NewGuid()}{extension}";
                var objectPath = $"{targetBucket}/{fileName}";
                var uploadUrl = $"{supabaseUrl}/storage/v1/object/{objectPath}";

                await using var stream = file.OpenReadStream();
                using var content = new StreamContent(stream);
                content.Headers.ContentType = new MediaTypeHeaderValue(
                    string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType);

                using var requestMessage = new HttpRequestMessage(HttpMethod.Post, uploadUrl)
                {
                    Content = content
                };
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
                requestMessage.Headers.Add("apikey", serviceRoleKey);
                requestMessage.Headers.Add("x-upsert", "false");

                var response = await _httpClient.SendAsync(requestMessage);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Supabase Storage upload failed ({StatusCode}): {Body}", response.StatusCode, errorBody);
                    return null;
                }

                // Returns public object URL
                return $"{supabaseUrl}/storage/v1/object/public/{objectPath}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error uploading image to Supabase Storage.");
                return null;
            }
        }
    }
}
