using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace WiMakit.API.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "First name is required.")]
        [MaxLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        [RegularExpression(@"^[a-zA-Z\s'-]+$", ErrorMessage = "First name can only contain letters, spaces, hyphens, and apostrophes.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required.")]
        [MaxLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        [RegularExpression(@"^[a-zA-Z\s'-]+$", ErrorMessage = "Last name can only contain letters, spaces, hyphens, and apostrophes.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        [MaxLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required.")]
        [RegularExpression("^(farmer|buyer)$", ErrorMessage = "Role must be 'farmer' or 'buyer'.")]
        public string Role { get; set; } = "buyer";

        [Phone(ErrorMessage = "Please enter a valid phone number.")]
        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string? Phone { get; set; }

        [MaxLength(100, ErrorMessage = "Location cannot exceed 100 characters.")]
        public string? Location { get; set; }

        // Role specific fields
        [MaxLength(50, ErrorMessage = "Farm size cannot exceed 50 characters.")]
        public string? FarmSize { get; set; }

        [MaxLength(50, ErrorMessage = "Farming experience cannot exceed 50 characters.")]
        public string? FarmingExperience { get; set; }

        [MaxLength(100, ErrorMessage = "Business name cannot exceed 100 characters.")]
        public string? BusinessName { get; set; }

        [MaxLength(50, ErrorMessage = "Business type cannot exceed 50 characters.")]
        public string? BusinessType { get; set; }

        [MaxLength(50, ErrorMessage = "NIN cannot exceed 50 characters.")]
        public string? NIN { get; set; }

        [MaxLength(30, ErrorMessage = "Document type cannot exceed 30 characters.")]
        public string? IdDocumentType { get; set; }

        public IFormFile? IdDocumentFront { get; set; }

        public IFormFile? IdDocumentBack { get; set; }
    }

    public class LoginRequest
    {
        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;
    }

    public class GoogleAuthRequest
    {
        [Required(ErrorMessage = "Google ID token is required.")]
        public string IdToken { get; set; } = string.Empty;

        public string? Role { get; set; }
        public string? Phone { get; set; }
        public string? Location { get; set; }
    }

    public class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserDTO User { get; set; } = null!;
        public bool MustChangePassword { get; set; } = false;
        public string? Message { get; set; }
    }

    public class UserDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}".Trim();
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? FarmSize { get; set; }
        public string? FarmingExperience { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool MustChangePassword { get; set; }
        public bool HasGoogleAuth { get; set; }
        public string? NIN { get; set; }
        public string? IdDocumentType { get; set; }
        public string? IdDocumentFrontUrl { get; set; }
        public string? IdDocumentBackUrl { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Current password is required.")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "New password is required.")]
        [MinLength(6, ErrorMessage = "New password must be at least 6 characters long.")]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class CreateAdminRequest
    {
        [Required(ErrorMessage = "First name is required.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty;

        public string? Phone { get; set; }
    }

    public class VerifyEmailRequest
    {
        [Required(ErrorMessage = "Verification token is required.")]
        public string Token { get; set; } = string.Empty;
    }

    public class VerifyOtpRequest
    {
        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "OTP code is required.")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP code must be exactly 6 digits.")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP code must consist of digits only.")]
        public string Otp { get; set; } = string.Empty;
    }

    public class ResendOtpRequest
    {
        [Required(ErrorMessage = "Email address is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;
    }

    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
