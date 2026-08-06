namespace WiMakit.API.DTOs
{
    public class UserProfileDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}".Trim();
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Nin { get; set; }
        public string? IdDocumentType { get; set; }
        public string? IdDocumentFrontUrl { get; set; }
        public string? IdDocumentBackUrl { get; set; }
        public string? District { get; set; }
        public string? Chiefdom { get; set; }
        public string? Community { get; set; }
        public string? FarmName { get; set; }
        public string? FarmAddress { get; set; }
        public string? FarmSize { get; set; }
        public string? FarmingExperience { get; set; }
        public string? PrimaryCrops { get; set; }
        public string? FarmDescription { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
        public int TrustScore { get; set; }
        public string VerificationStatus { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsEmailVerified { get; set; }
    }

    public class UpdateUserProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public string? Nin { get; set; }
        public string? District { get; set; }
        public string? Chiefdom { get; set; }
        public string? Community { get; set; }
        public string? FarmName { get; set; }
        public string? FarmAddress { get; set; }
        public string? FarmSize { get; set; }
        public string? FarmingExperience { get; set; }
        public string? PrimaryCrops { get; set; }
        public string? FarmDescription { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
    }
}
