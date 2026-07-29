using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace WiMakit.API.Services
{
    public interface IEmailService
    {
        Task<bool> SendVerificationEmailAsync(string email, string token);
    }

    public class EmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(
            HttpClient httpClient,
            ILogger<EmailService> logger,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
        }
        public async Task<bool> SendVerificationEmailAsync(string email, string token)
        {
            try
{
    var apiKey = _configuration["Resend:ApiKey"]?.Trim();
    var senderEmail = _configuration["Resend:SenderEmail"]?.Trim();
    var senderName = _configuration["Resend:SenderName"]?.Trim() ?? "WiMakit";

    _logger.LogInformation("Attempting to send verification email to {Email}", email);

    if (string.IsNullOrWhiteSpace(apiKey))
    {
        _logger.LogError("Resend API key is not configured.");

        _logger.LogWarning("************************************************************");
        _logger.LogWarning("EMAIL FALLBACK - Verification token for {Email}: {Token}", email, token);
        _logger.LogWarning("************************************************************");

        return false;
    }

    if (string.IsNullOrWhiteSpace(senderEmail))
    {
        _logger.LogError("Resend sender email is not configured.");

        _logger.LogWarning("************************************************************");
        _logger.LogWarning("EMAIL FALLBACK - Verification token for {Email}: {Token}", email, token);
        _logger.LogWarning("************************************************************");

        return false;
    }

    var htmlBody = GetVerificationEmailTemplate(token);

                _httpClient.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", apiKey);

var payload = new
{
    from = $"{senderName} <{senderEmail}>",
    to = new[] { email },
    subject = "Verify Your WiMakit Account",
    html = htmlBody
};

var content = new StringContent(
    JsonSerializer.Serialize(payload),
    Encoding.UTF8,
    "application/json");

var response = await _httpClient.PostAsync(
    "https://api.resend.com/emails",
    content);

response.EnsureSuccessStatusCode();

                _logger.LogInformation($"Verification email successfully sent to: {email}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send verification email to: {email}");

                // Fallback: Log to console for development
                _logger.LogWarning("************************************************************");
                _logger.LogWarning($"EMAIL FALLBACK - Verification token for {email}: {token}");
                _logger.LogWarning("************************************************************");

                return false;
            }
        }

        private string GetVerificationEmailTemplate(string token)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verify Your Account</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 0;'>
                <table role='presentation' style='width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 8px 8px 0 0;'>
                            <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>🌱 WiMakit</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px 0; color: #1f2937; font-size: 24px;'>Verify Your Email Address</h2>
                            <p style='margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;'>
                                Thank you for registering with WiMakit! To complete your registration and start connecting farmers with buyers, please verify your email address.
                            </p>
                            <p style='margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;'>
                                Your verification code is:
                            </p>
                            
                            <!-- OTP Box -->
                            <table role='presentation' style='width: 100%; border-collapse: collapse; margin: 0 0 30px 0;'>
                                <tr>
                                    <td align='center' style='padding: 20px; background-color: #f9fafb; border: 2px dashed #22c55e; border-radius: 8px;'>
                                        <div style='font-size: 36px; font-weight: bold; color: #22c55e; letter-spacing: 8px; font-family: monospace;'>
                                            {token}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style='margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;'>
                                Enter this code on the verification page to activate your account. This code will expire in 15 minutes.
                            </p>
                            
                            <div style='margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;'>
                                <p style='margin: 0; color: #92400e; font-size: 14px;'>
                                    <strong>⚠️ Security Note:</strong> If you didn't create an account with WiMakit, please ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;'>
                            <p style='margin: 0 0 10px 0; color: #6b7280; font-size: 14px;'>
                                Need help? Contact us at <a href='mailto:support@wimakit.com' style='color: #22c55e; text-decoration: none;'>support@wimakit.com</a>
                            </p>
                            <p style='margin: 0; color: #9ca3af; font-size: 12px;'>
                                © 2024 WiMakit. Connecting Sierra Leone's Agricultural Community.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }
    }
}