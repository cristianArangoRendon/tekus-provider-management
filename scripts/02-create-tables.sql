USE [TekusDB];
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Providers')
BEGIN
    CREATE TABLE Providers (
        ProviderId INT IDENTITY(1,1) PRIMARY KEY,
        Nit NVARCHAR(20) NOT NULL,
        ProviderName NVARCHAR(200) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        CustomFields NVARCHAR(MAX) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        
        CONSTRAINT UQ_Providers_Nit UNIQUE (Nit),
        CONSTRAINT CK_Providers_Email CHECK (Email LIKE '%_@__%.__%'),
        CONSTRAINT CK_Providers_Nit_Length CHECK (LEN(Nit) >= 9),
        CONSTRAINT CK_Providers_CustomFields_IsJson CHECK (CustomFields IS NULL OR ISJSON(CustomFields) = 1)
    );

    CREATE NONCLUSTERED INDEX IX_Providers_Nit ON Providers(Nit) WHERE IsActive = 1;
    CREATE NONCLUSTERED INDEX IX_Providers_Email ON Providers(Email) WHERE IsActive = 1;
    CREATE NONCLUSTERED INDEX IX_Providers_IsActive ON Providers(IsActive);
    CREATE NONCLUSTERED INDEX IX_Providers_ProviderName ON Providers(ProviderName) WHERE IsActive = 1;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Services')
BEGIN
    CREATE TABLE Services (
        ServiceId INT IDENTITY(1,1) PRIMARY KEY,
        ServiceName NVARCHAR(200) NOT NULL,
        HourlyRateUSD DECIMAL(10,2) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        
        CONSTRAINT UQ_Services_ServiceName UNIQUE (ServiceName),
        CONSTRAINT CK_Services_HourlyRate CHECK (HourlyRateUSD >= 0 AND HourlyRateUSD <= 10000)
    );

    CREATE NONCLUSTERED INDEX IX_Services_IsActive ON Services(IsActive);
    CREATE NONCLUSTERED INDEX IX_Services_ServiceName ON Services(ServiceName) WHERE IsActive = 1;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProviderServices')
BEGIN
    CREATE TABLE ProviderServices (
        ProviderServiceId INT IDENTITY(1,1) PRIMARY KEY,
        ProviderId INT NOT NULL,
        ServiceId INT NOT NULL,
        CountryCodes NVARCHAR(MAX) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        
        CONSTRAINT FK_ProviderServices_Provider 
            FOREIGN KEY (ProviderId) REFERENCES Providers(ProviderId),
        CONSTRAINT FK_ProviderServices_Service 
            FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId),
        CONSTRAINT UQ_ProviderServices_ProviderService 
            UNIQUE (ProviderId, ServiceId),
        CONSTRAINT CK_ProviderServices_CountryCodes_IsJson 
            CHECK (ISJSON(CountryCodes) = 1)
    );

    CREATE NONCLUSTERED INDEX IX_ProviderServices_Provider 
        ON ProviderServices(ProviderId) WHERE IsActive = 1;
    CREATE NONCLUSTERED INDEX IX_ProviderServices_Service 
        ON ProviderServices(ServiceId) WHERE IsActive = 1;
    CREATE NONCLUSTERED INDEX IX_ProviderServices_IsActive 
        ON ProviderServices(IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Countries')
BEGIN
    CREATE TABLE Countries (
        CountryId INT IDENTITY(1,1) PRIMARY KEY,
        CountryCode CHAR(2) NOT NULL,
        CountryName NVARCHAR(100) NOT NULL,
        Region NVARCHAR(50) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        LastSyncAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT UQ_Countries_CountryCode UNIQUE (CountryCode),
        CONSTRAINT CK_Countries_CountryCode_Length CHECK (LEN(CountryCode) = 2)
    );

    CREATE NONCLUSTERED INDEX IX_Countries_CountryCode 
        ON Countries(CountryCode) WHERE IsActive = 1;
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        AuditLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
        EntityType NVARCHAR(50) NOT NULL,
        EntityId INT NOT NULL,
        Action NVARCHAR(50) NOT NULL,
        ChangedBy NVARCHAR(100) NULL,
        ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        OldValues NVARCHAR(MAX) NULL,
        NewValues NVARCHAR(MAX) NULL,
        
        CONSTRAINT CK_AuditLog_Values_IsJson 
            CHECK (OldValues IS NULL OR ISJSON(OldValues) = 1),
        CONSTRAINT CK_AuditLog_NewValues_IsJson 
            CHECK (NewValues IS NULL OR ISJSON(NewValues) = 1)
    );

    CREATE NONCLUSTERED INDEX IX_AuditLog_Entity 
        ON AuditLog(EntityType, EntityId);
    CREATE NONCLUSTERED INDEX IX_AuditLog_ChangedAt 
        ON AuditLog(ChangedAt DESC);
END
GO