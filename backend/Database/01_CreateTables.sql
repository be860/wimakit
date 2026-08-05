-- Create Users table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'buyer',
    Phone NVARCHAR(20) NULL,
    Location NVARCHAR(100) NULL,
    IsEmailVerified BIT NOT NULL DEFAULT 0,
    EmailVerificationToken NVARCHAR(MAX) NULL,
    EmailVerificationExpiry DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL
);

-- Create Produces table
CREATE TABLE Produces (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FarmerId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Unit NVARCHAR(20) NOT NULL DEFAULT 'kg',
    Quantity INT NOT NULL,
    Location NVARCHAR(100) NULL,
    ImageUrl NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'available',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Produces_Farmer FOREIGN KEY (FarmerId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create Messages table
CREATE TABLE Messages (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SenderId INT NOT NULL,
    ReceiverId INT NOT NULL,
    ProduceId INT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderId) REFERENCES Users(Id),
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverId) REFERENCES Users(Id),
    CONSTRAINT FK_Messages_Produce FOREIGN KEY (ProduceId) REFERENCES Produces(Id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Produces_FarmerId ON Produces(FarmerId);
CREATE INDEX IX_Produces_Category ON Produces(Category);
CREATE INDEX IX_Produces_Status ON Produces(Status);
CREATE INDEX IX_Messages_SenderId ON Messages(SenderId);
CREATE INDEX IX_Messages_ReceiverId ON Messages(ReceiverId);
CREATE INDEX IX_Messages_ProduceId ON Messages(ProduceId);
CREATE INDEX IX_Messages_CreatedAt ON Messages(CreatedAt);
