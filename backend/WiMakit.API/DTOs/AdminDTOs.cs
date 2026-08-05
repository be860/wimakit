namespace WiMakit.API.DTOs
{
    public class AdminMetricsDTO
    {
        public int TotalFarmers { get; set; }
        public int TotalBuyers { get; set; }
        public int PendingFarmerApprovals { get; set; }
        public int PendingProductApprovals { get; set; }
        public int OpenFraudCases { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ActiveProductListings { get; set; }
        public int OrdersThisMonth { get; set; }
        public List<MonthlyMetricDTO> RevenueByMonth { get; set; } = new();
        public List<MonthlyGrowthDTO> GrowthByMonth { get; set; } = new();
        public List<CropVolumeDTO> TopCrops { get; set; } = new();
        public List<DistrictBreakdownDTO> DistrictBreakdown { get; set; } = new();
    }

    public class MonthlyMetricDTO
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }

    public class MonthlyGrowthDTO
    {
        public string Month { get; set; } = string.Empty;
        public int Farmers { get; set; }
        public int Buyers { get; set; }
    }

    public class CropVolumeDTO
    {
        public string Crop { get; set; } = string.Empty;
        public int Volume { get; set; }
    }

    public class DistrictBreakdownDTO
    {
        public string District { get; set; } = string.Empty;
        public int Farmers { get; set; }
        public int Buyers { get; set; }
    }

    public class FarmerAdminDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Nin { get; set; }
        public string? Phone { get; set; }
        public string? District { get; set; }
        public string? Chiefdom { get; set; }
        public string? Community { get; set; }
        public List<string> Crops { get; set; } = new();
        public string? FarmSize { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TrustScore { get; set; }
        public bool Verified { get; set; }
        public DateTime Submitted { get; set; }
        public int Listings { get; set; }
        public decimal TotalSales { get; set; }
    }

    public class UpdateFarmerStatusRequest
    {
        public string Status { get; set; } = string.Empty; // "Approved", "Rejected", "Suspended"
        public string? Note { get; set; }
    }

    public class BuyerAdminDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? District { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Orders { get; set; }
        public decimal Spend { get; set; }
        public DateTime Joined { get; set; }
    }

    public class UpdateBuyerStatusRequest
    {
        public string Status { get; set; } = string.Empty; // "Active", "Suspended"
    }

    public class ProductAdminDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Farmer { get; set; } = string.Empty;
        public int FarmerId { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? District { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime Submitted { get; set; }
    }

    public class UpdateProductStatusRequest
    {
        public string Status { get; set; } = string.Empty; // "Approved", "Live", "Hidden", "Rejected"
        public string? Note { get; set; }
    }

    public class FraudCaseDTO
    {
        public int Id { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string Buyer { get; set; } = string.Empty;
        public string Farmer { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime Reported { get; set; }
        public string? AssignedTo { get; set; }
    }

    public class UpdateFraudCaseRequest
    {
        public string Status { get; set; } = string.Empty; // "Open", "Under Review", "Resolved", "Rejected"
        public string? AssignedTo { get; set; }
    }

    public class BroadcastNotificationRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? TargetRole { get; set; }
    }

    public class AuditLogDTO
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? TargetType { get; set; }
        public string? TargetId { get; set; }
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
