using System.ComponentModel.DataAnnotations;

namespace WiMakit.API.DTOs
{
    public class RegisterRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "buyer";
        
        public string? Phone { get; set; }
        public string? Location { get; set; }
        
        // Role specific fields
        public string? FarmSize { get; set; }
        public string? FarmingExperience { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
    }
    
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
    
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDTO User { get; set; } = null!;
    }
    
    public class UserDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? FarmSize { get; set; }
        public string? FarmingExperience { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
        public bool IsEmailVerified { get; set; }
    }
    
    public class VerifyEmailRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }
}
