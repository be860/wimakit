using Microsoft.EntityFrameworkCore;
using WiMakit.API.Data;
using WiMakit.API.DTOs;
using WiMakit.API.Models;

namespace WiMakit.API.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<AdminService> _logger;

        public AdminService(AppDbContext context, IEmailService emailService, ILogger<AdminService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AdminMetricsDTO> GetAdminMetricsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var totalFarmers = await _context.Users.CountAsync(u => u.Role.ToLower() == "farmer");
            var totalBuyers = await _context.Users.CountAsync(u => u.Role.ToLower() == "buyer");

            var pendingFarmers = await _context.Users.CountAsync(u => u.Role.ToLower() == "farmer" && (string.IsNullOrEmpty(u.VerificationStatus) || u.VerificationStatus.ToLower() == "pending"));
            var pendingProducts = await _context.Produces.CountAsync(p => p.Status == "Pending");
            var openFraudCases = await _context.FraudCases.CountAsync(f => f.Status == "Open" || f.Status == "Under Review");

            var totalRevenue = await _context.Orders.Where(o => o.Status != "Cancelled").SumAsync(o => (decimal?)o.Amount) ?? 0m;
            var activeListings = await _context.Produces.CountAsync(p => p.Status == "Live");
            var ordersThisMonth = await _context.Orders.CountAsync(o => o.CreatedAt >= startOfMonth);

            // Monthly Revenue for last 6 months
            var monthlyRevenue = new List<MonthlyMetricDTO>();
            for (int i = 5; i >= 0; i--)
            {
                var monthDate = now.AddMonths(-i);
                var monthStart = new DateTime(monthDate.Year, monthDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var monthEnd = monthStart.AddMonths(1);

                var rev = await _context.Orders
                    .Where(o => o.CreatedAt >= monthStart && o.CreatedAt < monthEnd && o.Status != "Cancelled")
                    .SumAsync(o => (decimal?)o.Amount) ?? 0m;

                var ordCount = await _context.Orders
                    .CountAsync(o => o.CreatedAt >= monthStart && o.CreatedAt < monthEnd);

                monthlyRevenue.Add(new MonthlyMetricDTO
                {
                    Month = monthDate.ToString("MMM yy"),
                    Revenue = rev,
                    Orders = ordCount
                });
            }

            // Growth by Month (last 6 months)
            var monthlyGrowth = new List<MonthlyGrowthDTO>();
            for (int i = 5; i >= 0; i--)
            {
                var monthDate = now.AddMonths(-i);
                var monthStart = new DateTime(monthDate.Year, monthDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var monthEnd = monthStart.AddMonths(1);

                var newFarmers = await _context.Users.CountAsync(u => u.Role == "farmer" && u.CreatedAt >= monthStart && u.CreatedAt < monthEnd);
                var newBuyers = await _context.Users.CountAsync(u => u.Role == "buyer" && u.CreatedAt >= monthStart && u.CreatedAt < monthEnd);

                monthlyGrowth.Add(new MonthlyGrowthDTO
                {
                    Month = monthDate.ToString("MMM"),
                    Farmers = newFarmers,
                    Buyers = newBuyers
                });
            }

            // Top Crops
            var topCrops = await _context.Produces
                .GroupBy(p => p.Category)
                .Select(g => new CropVolumeDTO
                {
                    Crop = g.Key,
                    Volume = g.Sum(p => p.Quantity)
                })
                .Take(8)
                .ToListAsync();

            // District Breakdown
            var districtBreakdown = await _context.Users
                .Where(u => !string.IsNullOrEmpty(u.District))
                .GroupBy(u => u.District!)
                .Select(g => new DistrictBreakdownDTO
                {
                    District = g.Key,
                    Farmers = g.Count(u => u.Role == "farmer"),
                    Buyers = g.Count(u => u.Role == "buyer")
                })
                .ToListAsync();

            return new AdminMetricsDTO
            {
                TotalFarmers = totalFarmers,
                TotalBuyers = totalBuyers,
                PendingFarmerApprovals = pendingFarmers,
                PendingProductApprovals = pendingProducts,
                OpenFraudCases = openFraudCases,
                TotalRevenue = totalRevenue,
                ActiveProductListings = activeListings,
                OrdersThisMonth = ordersThisMonth,
                RevenueByMonth = monthlyRevenue,
                GrowthByMonth = monthlyGrowth,
                TopCrops = topCrops,
                DistrictBreakdown = districtBreakdown
            };
        }

        public async Task<IEnumerable<FarmerAdminDTO>> GetFarmersAsync(string? status, string? search, string? district)
        {
            var query = _context.Users
                .Where(u => u.Role.ToLower() == "farmer")
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var s = status.Trim().ToLowerInvariant();
                if (s == "pending")
                {
                    query = query.Where(u => string.IsNullOrEmpty(u.VerificationStatus) || u.VerificationStatus.ToLower() == "pending" || u.Status.ToLower() == "pending");
                }
                else
                {
                    query = query.Where(u => u.VerificationStatus.ToLower() == s || u.Status.ToLower() == s);
                }
            }

            if (!string.IsNullOrWhiteSpace(district))
            {
                var d = district.Trim().ToLowerInvariant();
                query = query.Where(u => (u.District != null && u.District.ToLower() == d) || (u.Location != null && u.Location.ToLower() == d));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.Trim().ToLowerInvariant();
                query = query.Where(u =>
                    u.FirstName.ToLower().Contains(q) ||
                    u.LastName.ToLower().Contains(q) ||
                    u.Email.ToLower().Contains(q) ||
                    (u.Phone != null && u.Phone.ToLower().Contains(q)));
            }

            var farmers = await query
                .Include(u => u.Produces)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            var farmerIds = farmers.Select(f => f.Id).ToList();
            var salesMap = await _context.Orders
                .Where(o => farmerIds.Contains(o.FarmerId) && o.Status != "Cancelled")
                .GroupBy(o => o.FarmerId)
                .Select(g => new { FarmerId = g.Key, TotalSales = g.Sum(o => o.Amount) })
                .ToDictionaryAsync(x => x.FarmerId, x => x.TotalSales);

            return farmers.Select(f => new FarmerAdminDTO
            {
                Id = f.Id,
                Name = f.FullName,
                Email = f.Email,
                Nin = f.NIN,
                IdDocumentType = f.IdDocumentType,
                IdDocumentFrontUrl = f.IdDocumentFrontUrl,
                IdDocumentBackUrl = f.IdDocumentBackUrl,
                ProfilePhotoUrl = f.ProfilePhotoUrl,
                FarmPhotoUrl = f.FarmPhotoUrl,
                Phone = f.Phone,
                District = !string.IsNullOrEmpty(f.District) ? f.District : (!string.IsNullOrEmpty(f.Location) ? f.Location : "Western Area Rural"),
                Chiefdom = f.Chiefdom,
                Community = f.Community,
                FarmName = f.FarmName,
                FarmAddress = f.FarmAddress,
                FarmDescription = f.FarmDescription,
                FarmingExperience = f.FarmingExperience,
                Crops = !string.IsNullOrEmpty(f.PrimaryCrops)
                    ? f.PrimaryCrops.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(c => c.Trim()).ToList()
                    : new List<string>(),
                FarmSize = f.FarmSize,
                Status = !string.IsNullOrEmpty(f.VerificationStatus) ? f.VerificationStatus : "Pending",
                TrustScore = f.TrustScore,
                Verified = string.Equals(f.VerificationStatus, "Approved", StringComparison.OrdinalIgnoreCase),
                Submitted = f.CreatedAt,
                Listings = f.Produces.Count,
                TotalSales = salesMap.TryGetValue(f.Id, out var sales) ? sales : 0m
            });
        }

        public async Task<FarmerAdminDTO?> GetFarmerByIdAsync(int id)
        {
            var list = await GetFarmersAsync(null, null, null);
            return list.FirstOrDefault(f => f.Id == id);
        }

        public async Task<bool> UpdateFarmerStatusAsync(int id, string status, string? note, int adminId, string adminName)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "farmer");
            if (user == null) return false;

            user.VerificationStatus = status;
            string? temporaryPassword = null;

            if (status == "Suspended")
            {
                user.Status = "Suspended";
            }
            else if (status == "Approved")
            {
                user.Status = "Active";
                user.ApprovedBy = adminName;
                user.ApprovalDate = DateTime.UtcNow;

                // Issue a fresh one-time password and require the farmer to change it
                // on first login. This is emailed to the farmer below.
                temporaryPassword = GenerateTemporaryPassword();
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword);
                user.MustChangePassword = true;
                user.IsEmailVerified = true;
            }

            user.UpdatedAt = DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = $"UPDATE_FARMER_STATUS_{status.ToUpper()}",
                TargetType = "Farmer",
                TargetId = id.ToString(),
                Details = note ?? $"Updated farmer verification status to {status}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            if (status == "Approved" && temporaryPassword != null)
            {
                var emailSent = await _emailService.SendFarmerApprovalEmailAsync(user.Email, user.FullName, temporaryPassword);
                if (!emailSent)
                {
                    _logger.LogWarning("Farmer approval email could not be sent to {Email} (farmer id {Id}).", user.Email, user.Id);
                }
            }

            return true;
        }

        private static string GenerateTemporaryPassword()
        {
            // 10-character password drawn from an unambiguous alphabet (no 0/O/1/I/l),
            // mixing letters and digits so it reads clearly in an email.
            const string alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
            var bytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(10);
            var chars = new char[10];
            for (var i = 0; i < chars.Length; i++)
            {
                chars[i] = alphabet[bytes[i] % alphabet.Length];
            }
            return new string(chars);
        }

        public async Task<IEnumerable<BuyerAdminDTO>> GetBuyersAsync(string? status, string? search)
        {
            var query = _context.Users
                .Where(u => u.Role == "buyer")
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var s = status.Trim().ToLowerInvariant();
                query = query.Where(u => u.Status.ToLower() == s);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.Trim().ToLowerInvariant();
                query = query.Where(u =>
                    u.FirstName.ToLower().Contains(q) ||
                    u.LastName.ToLower().Contains(q) ||
                    u.Email.ToLower().Contains(q) ||
                    (u.BusinessName != null && u.BusinessName.ToLower().Contains(q)));
            }

            var buyers = await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
            var buyerIds = buyers.Select(b => b.Id).ToList();

            var orderStats = await _context.Orders
                .Where(o => buyerIds.Contains(o.BuyerId))
                .GroupBy(o => o.BuyerId)
                .Select(g => new { BuyerId = g.Key, OrdersCount = g.Count(), Spend = g.Sum(o => o.Amount) })
                .ToDictionaryAsync(x => x.BuyerId, x => x);

            return buyers.Select(b =>
            {
                orderStats.TryGetValue(b.Id, out var stats);
                return new BuyerAdminDTO
                {
                    Id = b.Id,
                    Name = b.FullName,
                    Email = b.Email,
                    Organization = b.BusinessName ?? "Individual Buyer",
                    Type = b.BusinessType ?? "Retailer",
                    District = b.District ?? b.Location,
                    Phone = b.Phone,
                    Status = b.Status,
                    Orders = stats?.OrdersCount ?? 0,
                    Spend = stats?.Spend ?? 0m,
                    Joined = b.CreatedAt
                };
            });
        }

        public async Task<bool> UpdateBuyerStatusAsync(int id, string status, int adminId, string adminName)
        {
            var buyer = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "buyer");
            if (buyer == null) return false;

            buyer.Status = status;
            buyer.UpdatedAt = DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = $"UPDATE_BUYER_STATUS_{status.ToUpper()}",
                TargetType = "Buyer",
                TargetId = id.ToString(),
                Details = $"Updated buyer status to {status}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ProductAdminDTO>> GetProductsAsync(string? status, string? search)
        {
            var query = _context.Produces
                .Include(p => p.Farmer)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var s = status.Trim().ToLowerInvariant();
                query = query.Where(p => p.Status.ToLower() == s);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.Trim().ToLowerInvariant();
                query = query.Where(p => p.Name.ToLower().Contains(q) || p.Category.ToLower().Contains(q));
            }

            var products = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

            return products.Select(p => new ProductAdminDTO
            {
                Id = p.Id,
                Name = p.Name,
                Farmer = p.Farmer != null ? p.Farmer.FullName : "Unknown",
                FarmerId = p.FarmerId,
                Category = p.Category,
                Unit = p.Unit,
                Price = p.Price,
                Stock = p.Stock,
                District = p.District ?? p.Location,
                Status = p.Status,
                Submitted = p.CreatedAt
            });
        }

        public async Task<bool> UpdateProductStatusAsync(int id, string status, string? note, int adminId, string adminName)
        {
            var product = await _context.Produces.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return false;

            product.Status = status;
            product.UpdatedAt = DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = $"UPDATE_PRODUCT_STATUS_{status.ToUpper()}",
                TargetType = "Product",
                TargetId = id.ToString(),
                Details = note ?? $"Updated product status to {status}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ProductAdminDTO> CreateProductAsync(CreateProductAdminRequest request, int adminId, string adminName)
        {
            var product = new Produce
            {
                FarmerId = request.FarmerId,
                Name = request.Name,
                Category = request.Category,
                Description = request.Description,
                Price = request.Price,
                Unit = request.Unit,
                Quantity = request.Quantity,
                Location = request.Location,
                District = request.District,
                ImageUrl = request.ImageUrl,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Live" : request.Status,
            };

            _context.Produces.Add(product);
            await _context.SaveChangesAsync();

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = "CREATE_PRODUCT",
                TargetType = "Product",
                TargetId = product.Id.ToString(),
                Details = $"Created product '{product.Name}' for farmer #{product.FarmerId}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            await _context.Entry(product).Reference(p => p.Farmer).LoadAsync();

            return new ProductAdminDTO
            {
                Id = product.Id,
                Name = product.Name,
                Farmer = product.Farmer != null ? product.Farmer.FullName : "Unknown",
                FarmerId = product.FarmerId,
                Category = product.Category,
                Unit = product.Unit,
                Price = product.Price,
                Stock = product.Stock,
                District = product.District ?? product.Location,
                Status = product.Status,
                Submitted = product.CreatedAt
            };
        }

        public async Task<ProductAdminDTO?> UpdateProductAsync(int id, UpdateProductAdminRequest request, int adminId, string adminName)
        {
            var product = await _context.Produces
                .Include(p => p.Farmer)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return null;

            if (!string.IsNullOrEmpty(request.Name)) product.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Category)) product.Category = request.Category;
            if (!string.IsNullOrEmpty(request.Description)) product.Description = request.Description;
            if (request.Price.HasValue) product.Price = request.Price.Value;
            if (!string.IsNullOrEmpty(request.Unit)) product.Unit = request.Unit;
            if (request.Quantity.HasValue) product.Quantity = request.Quantity.Value;
            if (request.Location != null) product.Location = request.Location;
            if (request.District != null) product.District = request.District;
            if (request.ImageUrl != null) product.ImageUrl = request.ImageUrl;
            if (!string.IsNullOrEmpty(request.Status)) product.Status = request.Status;

            product.UpdatedAt = DateTime.UtcNow;

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = "UPDATE_PRODUCT",
                TargetType = "Product",
                TargetId = id.ToString(),
                Details = $"Updated product '{product.Name}'",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return new ProductAdminDTO
            {
                Id = product.Id,
                Name = product.Name,
                Farmer = product.Farmer != null ? product.Farmer.FullName : "Unknown",
                FarmerId = product.FarmerId,
                Category = product.Category,
                Unit = product.Unit,
                Price = product.Price,
                Stock = product.Stock,
                District = product.District ?? product.Location,
                Status = product.Status,
                Submitted = product.CreatedAt
            };
        }

        public async Task<bool> DeleteProductAsync(int id, int adminId, string adminName)
        {
            var product = await _context.Produces.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return false;

            var name = product.Name;
            _context.Produces.Remove(product);

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = "DELETE_PRODUCT",
                TargetType = "Product",
                TargetId = id.ToString(),
                Details = $"Deleted product '{name}'",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<FraudCaseDTO>> GetFraudCasesAsync(string? status)
        {
            var query = _context.FraudCases
                .Include(f => f.Buyer)
                .Include(f => f.Farmer)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var s = status.Trim().ToLowerInvariant();
                query = query.Where(f => f.Status.ToLower() == s);
            }

            var cases = await query.OrderByDescending(f => f.ReportedAt).ToListAsync();

            return cases.Select(f => new FraudCaseDTO
            {
                Id = f.Id,
                CaseNumber = f.CaseNumber,
                OrderId = f.OrderId != null ? $"WM-ORD-{f.OrderId}" : "N/A",
                Buyer = f.Buyer != null ? f.Buyer.FullName : "Unknown",
                Farmer = f.Farmer != null ? f.Farmer.FullName : "Unknown",
                Reason = f.Reason,
                Amount = f.Amount,
                Status = f.Status,
                Reported = f.ReportedAt,
                AssignedTo = f.AssignedTo
            });
        }

        public async Task<FraudCaseDTO?> GetFraudCaseByIdAsync(int id)
        {
            var cases = await GetFraudCasesAsync(null);
            return cases.FirstOrDefault(c => c.Id == id);
        }

        public async Task<bool> UpdateFraudCaseStatusAsync(int id, string status, string? assignedTo, int adminId, string adminName)
        {
            var fc = await _context.FraudCases.FirstOrDefaultAsync(f => f.Id == id);
            if (fc == null) return false;

            fc.Status = status;
            if (!string.IsNullOrEmpty(assignedTo)) fc.AssignedTo = assignedTo;

            if (status == "Resolved" || status == "Rejected")
            {
                fc.ResolvedAt = DateTime.UtcNow;
            }

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = $"UPDATE_FRAUD_CASE_{status.ToUpper()}",
                TargetType = "FraudCase",
                TargetId = id.ToString(),
                Details = $"Updated fraud case to {status}. Assigned: {fc.AssignedTo}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AuditLogDTO>> GetAuditLogsAsync()
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.CreatedAt)
                .Take(100)
                .Select(a => new AuditLogDTO
                {
                    Id = a.Id,
                    AdminId = a.AdminId,
                    AdminName = a.AdminName,
                    Action = a.Action,
                    TargetType = a.TargetType,
                    TargetId = a.TargetId,
                    Details = a.Details,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> BroadcastNotificationAsync(BroadcastNotificationRequest request, int adminId, string adminName)
        {
            var notif = new Notification
            {
                UserId = null,
                Type = "broadcast",
                Title = request.Title,
                Body = request.Body,
                IsUnread = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notif);

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = adminId,
                AdminName = adminName,
                Action = "BROADCAST_NOTIFICATION",
                TargetType = "Notification",
                TargetId = null,
                Details = $"Broadcast: {request.Title}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(bool success, string message, UserDTO? user)> CreateAdminAsync(CreateAdminRequest request, int creatorId, string creatorName)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
            {
                return (false, "Email is already registered.", null);
            }

            var admin = new User
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "SuperAdmin",
                Phone = request.Phone?.Trim(),
                Location = "Waterloo",
                District = "Western Area Rural",
                IsEmailVerified = true,
                MustChangePassword = true,
                VerificationStatus = "Approved",
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();

            _context.AuditLogs.Add(new AuditLog
            {
                AdminId = creatorId,
                AdminName = creatorName,
                Action = "CREATE_ADMIN",
                TargetType = "User",
                TargetId = admin.Id.ToString(),
                Details = $"Created new SuperAdmin account for {admin.Email} by {creatorName}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var userDto = new UserDTO
            {
                Id = admin.Id,
                FirstName = admin.FirstName,
                LastName = admin.LastName,
                Email = admin.Email,
                Role = admin.Role,
                Phone = admin.Phone,
                IsEmailVerified = true,
                MustChangePassword = true
            };

            return (true, "SuperAdmin account created successfully.", userDto);
        }
    }
}
