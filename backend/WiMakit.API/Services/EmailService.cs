using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Text.Json;

namespace WiMakit.API.Services
{
    public interface IEmailService
    {
        Task<bool> SendVerificationEmailAsync(string email, string token);

        /// <summary>
        /// Sends the farmer their login credentials (email + one-time temporary password)
        /// after a superadmin approves their account. The farmer must change this
        /// password on first login (MustChangePassword is set true by the caller).
        /// </summary>
        Task<bool> SendFarmerApprovalEmailAsync(string email, string fullName, string temporaryPassword);

        /// <summary>
        /// Sends a one-time 6-digit code the user can use to set a new password
        /// after requesting a "forgot password" reset. Expires in 15 minutes.
        /// </summary>
        Task<bool> SendPasswordResetEmailAsync(string email, string otp);
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

        public async Task<bool> SendPasswordResetEmailAsync(string email, string otp)
        {
            try
            {
                var apiKey = _configuration["Resend:ApiKey"]?.Trim();
                var senderEmail = _configuration["Resend:SenderEmail"]?.Trim();
                var senderName = _configuration["Resend:SenderName"]?.Trim() ?? "WiMakit";

                _logger.LogInformation("Attempting to send password reset email to {Email}", email);

                if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
                {
                    _logger.LogError("Resend API key or sender email is not configured.");

                    _logger.LogWarning("************************************************************");
                    _logger.LogWarning("EMAIL FALLBACK - Password reset code for {Email}: {Otp}", email, otp);
                    _logger.LogWarning("************************************************************");

                    return false;
                }

                var htmlBody = GetPasswordResetEmailTemplate(otp);

                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", apiKey);

                var payload = new
                {
                    from = $"{senderName} <{senderEmail}>",
                    to = new[] { email },
                    subject = "Reset Your WiMakit Password",
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

                _logger.LogInformation("Password reset email successfully sent to: {Email}", email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to: {Email}", email);

                _logger.LogWarning("************************************************************");
                _logger.LogWarning("EMAIL FALLBACK - Password reset code for {Email}: {Otp}", email, otp);
                _logger.LogWarning("************************************************************");

                return false;
            }
        }

        public async Task<bool> SendFarmerApprovalEmailAsync(string email, string fullName, string temporaryPassword)
        {
            try
            {
                var apiKey = _configuration["Resend:ApiKey"]?.Trim();
                var senderEmail = _configuration["Resend:SenderEmail"]?.Trim();
                var senderName = _configuration["Resend:SenderName"]?.Trim() ?? "WiMakit";

                _logger.LogInformation("Attempting to send farmer approval email to {Email}", email);

                if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
                {
                    _logger.LogError("Resend API key or sender email is not configured.");

                    _logger.LogWarning("************************************************************");
                    _logger.LogWarning("EMAIL FALLBACK - Approval credentials for {Email}: temporary password = {Password}", email, temporaryPassword);
                    _logger.LogWarning("************************************************************");

                    return false;
                }

                var htmlBody = GetFarmerApprovalEmailTemplate(fullName, email, temporaryPassword);

                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", apiKey);

                var payload = new
                {
                    from = $"{senderName} <{senderEmail}>",
                    to = new[] { email },
                    subject = "Your WiMakit Farmer Account Has Been Approved",
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

                _logger.LogInformation("Farmer approval email successfully sent to: {Email}", email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send farmer approval email to: {Email}", email);

                _logger.LogWarning("************************************************************");
                _logger.LogWarning("EMAIL FALLBACK - Approval credentials for {Email}: temporary password = {Password}", email, temporaryPassword);
                _logger.LogWarning("************************************************************");

                return false;
            }
        }

        /// <summary>
        /// Base64 data URI for the WiMakit logo, lazily loaded once from the
        /// embedded resource and reused for every email. Embedding the logo
        /// keeps branding rendering correctly in emails regardless of whether
        /// the frontend domain is live, reachable, or blocks hotlinking —
        /// there's no external image request for the email client to make.
        /// </summary>
        private static readonly Lazy<string> LogoDataUri = new(() =>
        {
            var assembly = Assembly.GetExecutingAssembly();
            const string resourceName = "WiMakit.API.Assets.wimakit-logo.png";

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
                return string.Empty;

            using var memoryStream = new MemoryStream();
            stream.CopyTo(memoryStream);
            var base64 = Convert.ToBase64String(memoryStream.ToArray());

            return $"data:image/png;base64,{base64}";
        });

        private string GetEmailHeader()
        {
            var logoMarkup = BuildLogoMarkup();

            return $@"
                    <tr>
                        <td style='padding: 32px 40px; text-align: center; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 8px 8px 0 0;'>
                            {logoMarkup}
                        </td>
                    </tr>";
        }

        /// <summary>
        /// Prefers a hosted URL to the logo (served from this API's own
        /// wwwroot, so it isn't at the mercy of the frontend domain being up)
        /// when "App:ApiBaseUrl" is configured — this renders more reliably
        /// across email clients than an inline image. Falls back to an
        /// embedded base64 data URI, and finally to plain text, so branding
        /// never fully breaks even with zero configuration.
        /// </summary>
        private string BuildLogoMarkup()
        {
            var apiBaseUrl = _configuration["App:ApiBaseUrl"]?.Trim().TrimEnd('/');
            if (!string.IsNullOrWhiteSpace(apiBaseUrl))
            {
                var logoUrl = $"{apiBaseUrl}/images/wimakit-logo.png";
                return $"<img src='{logoUrl}' alt='WiMakit' style='height: 36px; width: auto; max-width: 220px; display: inline-block;' />";
            }

            var logoDataUri = LogoDataUri.Value;
            if (!string.IsNullOrEmpty(logoDataUri))
                return $"<img src='{logoDataUri}' alt='WiMakit' style='height: 36px; width: auto; max-width: 220px; display: inline-block;' />";

            return "<h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;'>WiMakit</h1>";
        }

        private string GetFarmerApprovalEmailTemplate(string fullName, string email, string temporaryPassword)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Account Approved</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 0;'>
                <table role='presentation' style='width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    {GetEmailHeader()}

                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px 0; color: #1f2937; font-size: 24px;'>You're Approved, {fullName}! 🎉</h2>
                            <p style='margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;'>
                                Great news — WiMakit staff have reviewed and approved your farmer account. You can now sign in and start listing your produce for buyers across Sierra Leone.
                            </p>
                            <p style='margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;'>
                                Here are your login credentials:
                            </p>

                            <!-- Credentials Box -->
                            <table role='presentation' style='width: 100%; border-collapse: collapse; margin: 0 0 20px 0;'>
                                <tr>
                                    <td style='padding: 20px; background-color: #f9fafb; border: 2px dashed #22c55e; border-radius: 8px;'>
                                        <p style='margin: 0 0 8px 0; color: #4b5563; font-size: 14px;'>
                                            <strong>Email:</strong> {email}
                                        </p>
                                        <p style='margin: 0; color: #4b5563; font-size: 14px;'>
                                            <strong>Temporary password:</strong>
                                        </p>
                                        <p style='margin: 6px 0 0 0; font-size: 28px; font-weight: bold; color: #22c55e; letter-spacing: 4px; font-family: monospace;'>
                                            {temporaryPassword}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <div style='margin: 0 0 20px 0; padding: 16px 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;'>
                                <p style='margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;'>
                                    <strong>⚠️ Important:</strong> This is a one-time password. You will be required to set your own new password the first time you log in.
                                </p>
                            </div>

                            <p style='margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;'>
                                For your security, please do not share this password with anyone. If you did not expect this email, please contact WiMakit support immediately.
                            </p>
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
                    {GetEmailHeader()}
                    
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

        private string GetPasswordResetEmailTemplate(string otp)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Your Password</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 0;'>
                <table role='presentation' style='width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    {GetEmailHeader()}

                    <!-- Content -->
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 20px 0; color: #1f2937; font-size: 24px;'>Reset Your Password</h2>
                            <p style='margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;'>
                                We received a request to reset the password for your WiMakit account. Use the code below to set a new password.
                            </p>

                            <!-- OTP Box -->
                            <table role='presentation' style='width: 100%; border-collapse: collapse; margin: 0 0 30px 0;'>
                                <tr>
                                    <td align='center' style='padding: 20px; background-color: #f9fafb; border: 2px dashed #22c55e; border-radius: 8px;'>
                                        <div style='font-size: 36px; font-weight: bold; color: #22c55e; letter-spacing: 8px; font-family: monospace;'>
                                            {otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style='margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;'>
                                Enter this code on the reset password page to choose a new password. This code will expire in 15 minutes.
                            </p>

                            <div style='margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;'>
                                <p style='margin: 0; color: #92400e; font-size: 14px;'>
                                    <strong>⚠️ Security Note:</strong> If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
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