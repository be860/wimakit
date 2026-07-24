-- Seed sample users
INSERT INTO Users (Name, Email, PasswordHash, Role, Phone, Location, IsEmailVerified) VALUES
('John Farmer', 'john@farmer.com', '$2a$11$YourHashedPasswordHere', 'farmer', '+23276123456', 'Freetown', 1),
('Mary Buyer', 'mary@buyer.com', '$2a$11$YourHashedPasswordHere', 'buyer', '+23276654321', 'Bo', 1),
('Ahmed Hassan', 'ahmed@farmer.com', '$2a$11$YourHashedPasswordHere', 'farmer', '+23276111222', 'Makeni', 1);

-- Seed sample produce
INSERT INTO Produces (FarmerId, Name, Category, Description, Price, Unit, Quantity, Location, Status) VALUES
(1, 'Fresh Rice', 'grains', 'High-quality locally grown rice', 25000, 'bag', 50, 'Freetown', 'available'),
(1, 'Cassava', 'roots', 'Fresh cassava tubers', 15000, 'kg', 200, 'Freetown', 'available'),
(3, 'Palm Oil', 'oils', 'Pure red palm oil', 45000, 'liter', 30, 'Makeni', 'available');

-- Note: Passwords need to be properly hashed using BCrypt in your application
-- The hash shown above is just a placeholder
