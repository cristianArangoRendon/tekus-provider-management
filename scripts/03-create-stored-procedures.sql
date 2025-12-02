USE [TekusDB]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateProvider]
(
    @Nit           NVARCHAR(20),
    @ProviderName  NVARCHAR(200),
    @Email         NVARCHAR(100)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [Nit] = @Nit AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'A provider with this NIT already exists.' AS [Result];
            RETURN;
        END
        
        IF EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [Email] = @Email AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'A provider with this email already exists.' AS [Result];
            RETURN;
        END
        
        DECLARE @ProviderId INT;
        
        INSERT INTO [dbo].[Providers] ([Nit], [ProviderName], [Email], [CustomFields], [IsActive], [CreatedAt])
        VALUES (@Nit, @ProviderName, @Email, '{}', 1, GETUTCDATE());
        
        SET @ProviderId = SCOPE_IDENTITY();
        
        INSERT INTO [dbo].[AuditLog] ([EntityType], [EntityId], [Action], [ChangedAt], [NewValues])
        VALUES ('Provider', @ProviderId, 'Created', GETUTCDATE(),
                (SELECT * FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER));
        
        COMMIT TRAN;
        
        SELECT 
            CAST(1 AS BIT) AS [IsSuccess],
            'Provider created successfully.' AS [Result],
            @ProviderId AS [ProviderId];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT 
            CAST(0 AS BIT) AS [IsSuccess],
            ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateProvider]
(
    @ProviderId    INT,
    @ProviderName  NVARCHAR(200) = NULL,
    @Email         NVARCHAR(100) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'Provider not found.' AS [Result];
            RETURN;
        END
        
        IF @Email IS NOT NULL AND EXISTS (
            SELECT 1 FROM [dbo].[Providers] 
            WHERE [Email] = @Email AND [ProviderId] != @ProviderId AND [IsActive] = 1
        )
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'Email already exists.' AS [Result];
            RETURN;
        END
        
        UPDATE [dbo].[Providers]
        SET
            [ProviderName] = COALESCE(@ProviderName, [ProviderName]),
            [Email]        = COALESCE(@Email, [Email]),
            [UpdatedAt]    = GETUTCDATE()
        WHERE [ProviderId] = @ProviderId;
        
        COMMIT TRAN;
        
        SELECT 
            CAST(1 AS BIT) AS [IsSuccess],
            'Provider updated successfully.' AS [Result];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT 
            CAST(0 AS BIT) AS [IsSuccess],
            ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteProvider]
(
    @ProviderId INT
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'Provider not found.' AS [Result];
            RETURN;
        END
        
        UPDATE [dbo].[Providers]
        SET [IsActive] = 0, [UpdatedAt] = GETUTCDATE()
        WHERE [ProviderId] = @ProviderId;
        
        UPDATE [dbo].[ProviderServices]
        SET [IsActive] = 0, [UpdatedAt] = GETUTCDATE()
        WHERE [ProviderId] = @ProviderId;
        
        COMMIT TRAN;
        
        SELECT 
            CAST(1 AS BIT) AS [IsSuccess],
            'Provider deleted successfully.' AS [Result];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT 
            CAST(0 AS BIT) AS [IsSuccess],
            ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetProvidersPaged]
(
    @SearchTerm  NVARCHAR(255) = NULL,
    @IsActive    BIT           = NULL,
    @PageSize    INT           = NULL,
    @PageNumber  INT           = NULL,
    @SortBy      NVARCHAR(50)  = 'ProviderName',
    @SortOrder   NVARCHAR(4)   = 'ASC'
)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT, @TotalRecords INT;
    
    IF @PageSize IS NOT NULL AND @PageNumber IS NOT NULL
    BEGIN
        SET @Offset = (@PageNumber - 1) * @PageSize;
        
        SELECT @TotalRecords = COUNT(*)
        FROM [dbo].[Providers] P
        WHERE (@IsActive IS NULL OR P.[IsActive] = @IsActive)
            AND (@SearchTerm IS NULL OR P.[ProviderName] LIKE '%' + @SearchTerm + '%' OR P.[Nit] LIKE '%' + @SearchTerm + '%' OR P.[Email] LIKE '%' + @SearchTerm + '%');
        
        SELECT P.[ProviderId], P.[Nit], P.[ProviderName], P.[Email], P.[CustomFields], P.[CreatedAt], P.[UpdatedAt], COUNT(PS.[ProviderServiceId]) AS [TotalServices]
        FROM (
            SELECT ROW_NUMBER() OVER (
                    ORDER BY 
                        CASE WHEN @SortBy = 'ProviderName' AND @SortOrder = 'ASC' THEN P.[ProviderName] END ASC,
                        CASE WHEN @SortBy = 'ProviderName' AND @SortOrder = 'DESC' THEN P.[ProviderName] END DESC,
                        CASE WHEN @SortBy = 'CreatedAt' AND @SortOrder = 'ASC' THEN P.[CreatedAt] END ASC,
                        CASE WHEN @SortBy = 'CreatedAt' AND @SortOrder = 'DESC' THEN P.[CreatedAt] END DESC
                ) AS RowNum, P.[ProviderId], P.[Nit], P.[ProviderName], P.[Email], P.[CustomFields], P.[CreatedAt], P.[UpdatedAt]
            FROM [dbo].[Providers] P
            WHERE (@IsActive IS NULL OR P.[IsActive] = @IsActive)
                AND (@SearchTerm IS NULL OR P.[ProviderName] LIKE '%' + @SearchTerm + '%' OR P.[Nit] LIKE '%' + @SearchTerm + '%' OR P.[Email] LIKE '%' + @SearchTerm + '%')
        ) AS P
        LEFT JOIN [dbo].[ProviderServices] PS ON P.[ProviderId] = PS.[ProviderId] AND PS.[IsActive] = 1
        WHERE P.RowNum BETWEEN (@Offset + 1) AND (@Offset + @PageSize)
        GROUP BY P.RowNum, P.[ProviderId], P.[Nit], P.[ProviderName], P.[Email], P.[CustomFields], P.[CreatedAt], P.[UpdatedAt]
        ORDER BY P.RowNum;
        
        SELECT @TotalRecords AS TotalRecords;
    END
    ELSE
    BEGIN
        SELECT P.[ProviderId], P.[Nit], P.[ProviderName], P.[Email], P.[CustomFields], P.[CreatedAt], P.[UpdatedAt], COUNT(PS.[ProviderServiceId]) AS [TotalServices]
        FROM [dbo].[Providers] P
        LEFT JOIN [dbo].[ProviderServices] PS ON P.[ProviderId] = PS.[ProviderId] AND PS.[IsActive] = 1
        WHERE (@IsActive IS NULL OR P.[IsActive] = @IsActive)
            AND (@SearchTerm IS NULL OR P.[ProviderName] LIKE '%' + @SearchTerm + '%' OR P.[Nit] LIKE '%' + @SearchTerm + '%' OR P.[Email] LIKE '%' + @SearchTerm + '%')
        GROUP BY P.[ProviderId], P.[Nit], P.[ProviderName], P.[Email], P.[CustomFields], P.[CreatedAt], P.[UpdatedAt]
        ORDER BY 
            CASE WHEN @SortBy = 'ProviderName' AND @SortOrder = 'ASC' THEN P.[ProviderName] END ASC,
            CASE WHEN @SortBy = 'ProviderName' AND @SortOrder = 'DESC' THEN P.[ProviderName] END DESC,
            CASE WHEN @SortBy = 'CreatedAt' AND @SortOrder = 'ASC' THEN P.[CreatedAt] END ASC,
            CASE WHEN @SortBy = 'CreatedAt' AND @SortOrder = 'DESC' THEN P.[CreatedAt] END DESC;
    END
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateService]
(
    @ServiceName    NVARCHAR(200),
    @HourlyRateUSD  DECIMAL(10,2),
    @Description    NVARCHAR(500) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF EXISTS (SELECT 1 FROM [dbo].[Services] WHERE [ServiceName] = @ServiceName AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'A service with this name already exists.' AS [Result];
            RETURN;
        END
        
        DECLARE @ServiceId INT;
        
        INSERT INTO [dbo].[Services] ([ServiceName], [HourlyRateUSD], [Description], [IsActive], [CreatedAt])
        VALUES (@ServiceName, @HourlyRateUSD, @Description, 1, GETUTCDATE());
        
        SET @ServiceId = SCOPE_IDENTITY();
        
        COMMIT TRAN;
        
        SELECT 
            CAST(1 AS BIT) AS [IsSuccess],
            'Service created successfully.' AS [Result],
            @ServiceId AS [ServiceId];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT 
            CAST(0 AS BIT) AS [IsSuccess],
            ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateService]
(
    @ServiceId      INT,
    @ServiceName    NVARCHAR(200) = NULL,
    @HourlyRateUSD  DECIMAL(10,2) = NULL,
    @Description    NVARCHAR(500) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Services] WHERE [ServiceId] = @ServiceId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'Service not found.' AS [Result];
            RETURN;
        END
        
        IF @ServiceName IS NOT NULL AND EXISTS (
            SELECT 1 FROM [dbo].[Services] 
            WHERE [ServiceName] = @ServiceName AND [ServiceId] != @ServiceId AND [IsActive] = 1
        )
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'Service name already exists.' AS [Result];
            RETURN;
        END
        
        UPDATE [dbo].[Services]
        SET
            [ServiceName]   = COALESCE(@ServiceName, [ServiceName]),
            [HourlyRateUSD] = COALESCE(@HourlyRateUSD, [HourlyRateUSD]),
            [Description]   = COALESCE(@Description, [Description]),
            [UpdatedAt]     = GETUTCDATE()
        WHERE [ServiceId] = @ServiceId;
        
        COMMIT TRAN;
        
        SELECT 
            CAST(1 AS BIT) AS [IsSuccess],
            'Service updated successfully.' AS [Result];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT 
            CAST(0 AS BIT) AS [IsSuccess],
            ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteService]
(
    @ServiceId INT
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Services] WHERE [ServiceId] = @ServiceId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT 
                CAST(0 AS BIT) AS [IsSuccess],
                'Service not found.' AS [Result];
            RETURN;
        END
        
        UPDATE [dbo].[Services]
        SET [IsActive] = 0, [UpdatedAt] = GETUTCDATE()
        WHERE [ServiceId] = @ServiceId;
        
        COMMIT TRAN;
        
        SELECT 
            CAST(1 AS BIT) AS [IsSuccess],
            'Service deleted successfully.' AS [Result];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT 
            CAST(0 AS BIT) AS [IsSuccess],
            ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetServicesPaged]
(
    @SearchTerm  NVARCHAR(255) = NULL,
    @IsActive    BIT           = NULL,
    @PageSize    INT           = NULL,
    @PageNumber  INT           = NULL,
    @SortBy      NVARCHAR(50)  = 'ServiceName',
    @SortOrder   NVARCHAR(4)   = 'ASC'
)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT, @TotalRecords INT;
    
    IF @PageSize IS NOT NULL AND @PageNumber IS NOT NULL
    BEGIN
        SET @Offset = (@PageNumber - 1) * @PageSize;
        
        SELECT @TotalRecords = COUNT(*)
        FROM [dbo].[Services] S
        WHERE (@IsActive IS NULL OR S.[IsActive] = @IsActive)
            AND (@SearchTerm IS NULL OR S.[ServiceName] LIKE '%' + @SearchTerm + '%' OR S.[Description] LIKE '%' + @SearchTerm + '%');
        
        SELECT S.[ServiceId], S.[ServiceName], S.[HourlyRateUSD], S.[Description], S.[CreatedAt], S.[UpdatedAt]
        FROM (
            SELECT ROW_NUMBER() OVER (
                    ORDER BY 
                        CASE WHEN @SortBy = 'ServiceName' AND @SortOrder = 'ASC' THEN S.[ServiceName] END ASC,
                        CASE WHEN @SortBy = 'ServiceName' AND @SortOrder = 'DESC' THEN S.[ServiceName] END DESC,
                        CASE WHEN @SortBy = 'HourlyRateUSD' AND @SortOrder = 'ASC' THEN S.[HourlyRateUSD] END ASC,
                        CASE WHEN @SortBy = 'HourlyRateUSD' AND @SortOrder = 'DESC' THEN S.[HourlyRateUSD] END DESC
                ) AS RowNum, S.[ServiceId], S.[ServiceName], S.[HourlyRateUSD], S.[Description], S.[CreatedAt], S.[UpdatedAt]
            FROM [dbo].[Services] S
            WHERE (@IsActive IS NULL OR S.[IsActive] = @IsActive)
                AND (@SearchTerm IS NULL OR S.[ServiceName] LIKE '%' + @SearchTerm + '%' OR S.[Description] LIKE '%' + @SearchTerm + '%')
        ) AS S
        WHERE S.RowNum BETWEEN (@Offset + 1) AND (@Offset + @PageSize)
        ORDER BY S.RowNum;
        
        SELECT @TotalRecords AS TotalRecords;
    END
    ELSE
    BEGIN
        SELECT S.[ServiceId], S.[ServiceName], S.[HourlyRateUSD], S.[Description], S.[CreatedAt], S.[UpdatedAt]
        FROM [dbo].[Services] S
        WHERE (@IsActive IS NULL OR S.[IsActive] = @IsActive)
            AND (@SearchTerm IS NULL OR S.[ServiceName] LIKE '%' + @SearchTerm + '%' OR S.[Description] LIKE '%' + @SearchTerm + '%')
        ORDER BY 
            CASE WHEN @SortBy = 'ServiceName' AND @SortOrder = 'ASC' THEN S.[ServiceName] END ASC,
            CASE WHEN @SortBy = 'ServiceName' AND @SortOrder = 'DESC' THEN S.[ServiceName] END DESC;
    END
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_AssignServiceToProvider]
(
    @ProviderId    INT,
    @ServiceId     INT,
    @CountryCodes  NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Provider not found.' AS [Result];
            RETURN;
        END
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Services] WHERE [ServiceId] = @ServiceId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Service not found.' AS [Result];
            RETURN;
        END
        
        IF ISJSON(@CountryCodes) = 0
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Invalid country codes format.' AS [Result];
            RETURN;
        END
        
        IF EXISTS (SELECT 1 FROM [dbo].[ProviderServices] WHERE [ProviderId] = @ProviderId AND [ServiceId] = @ServiceId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'This service is already assigned to this provider.' AS [Result];
            RETURN;
        END
        
        DECLARE @ProviderServiceId INT;
        
        INSERT INTO [dbo].[ProviderServices] ([ProviderId], [ServiceId], [CountryCodes], [IsActive], [CreatedAt])
        VALUES (@ProviderId, @ServiceId, @CountryCodes, 1, GETUTCDATE());
        
        SET @ProviderServiceId = SCOPE_IDENTITY();
        
        COMMIT TRAN;
        
        SELECT CAST(1 AS BIT) AS [IsSuccess], 'Service assigned to provider successfully.' AS [Result], @ProviderServiceId AS [ProviderServiceId];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT CAST(0 AS BIT) AS [IsSuccess], ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_AddCustomFieldToProvider]
(
    @ProviderId  INT,
    @FieldName   NVARCHAR(100),
    @FieldValue  NVARCHAR(500)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Provider not found.' AS [Result];
            RETURN;
        END
        
        DECLARE @CurrentFields NVARCHAR(MAX);
        SELECT @CurrentFields = [CustomFields] FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId;
        
        IF @CurrentFields IS NULL OR @CurrentFields = ''
            SET @CurrentFields = '{}';
        
        IF JSON_VALUE(@CurrentFields, '$."' + @FieldName + '"') IS NOT NULL
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Custom field already exists.' AS [Result];
            RETURN;
        END
        
        DECLARE @NewFields NVARCHAR(MAX);
        SET @NewFields = JSON_MODIFY(@CurrentFields, '$."' + @FieldName + '"', @FieldValue);
        
        UPDATE [dbo].[Providers]
        SET [CustomFields] = @NewFields, [UpdatedAt] = GETUTCDATE()
        WHERE [ProviderId] = @ProviderId;
        
        COMMIT TRAN;
        
        SELECT CAST(1 AS BIT) AS [IsSuccess], 'Custom field added successfully.' AS [Result];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT CAST(0 AS BIT) AS [IsSuccess], ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateCustomFieldInProvider]
(
    @ProviderId  INT,
    @FieldName   NVARCHAR(100),
    @FieldValue  NVARCHAR(500)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Provider not found.' AS [Result];
            RETURN;
        END
        
        DECLARE @CurrentFields NVARCHAR(MAX);
        SELECT @CurrentFields = [CustomFields] FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId;
        
        IF JSON_VALUE(@CurrentFields, '$."' + @FieldName + '"') IS NULL
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Custom field not found.' AS [Result];
            RETURN;
        END
        
        DECLARE @NewFields NVARCHAR(MAX);
        SET @NewFields = JSON_MODIFY(@CurrentFields, '$."' + @FieldName + '"', @FieldValue);
        
        UPDATE [dbo].[Providers]
        SET [CustomFields] = @NewFields, [UpdatedAt] = GETUTCDATE()
        WHERE [ProviderId] = @ProviderId;
        
        COMMIT TRAN;
        
        SELECT CAST(1 AS BIT) AS [IsSuccess], 'Custom field updated successfully.' AS [Result];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT CAST(0 AS BIT) AS [IsSuccess], ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteCustomFieldFromProvider]
(
    @ProviderId  INT,
    @FieldName   NVARCHAR(100)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRAN;
        
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId AND [IsActive] = 1)
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Provider not found.' AS [Result];
            RETURN;
        END
        
        DECLARE @CurrentFields NVARCHAR(MAX);
        SELECT @CurrentFields = [CustomFields] FROM [dbo].[Providers] WHERE [ProviderId] = @ProviderId;
        
        IF JSON_VALUE(@CurrentFields, '$."' + @FieldName + '"') IS NULL
        BEGIN
            ROLLBACK TRAN;
            SELECT CAST(0 AS BIT) AS [IsSuccess], 'Custom field not found.' AS [Result];
            RETURN;
        END
        
        DECLARE @NewFields NVARCHAR(MAX);
        SET @NewFields = JSON_MODIFY(@CurrentFields, '$."' + @FieldName + '"', NULL);
        
        UPDATE [dbo].[Providers]
        SET [CustomFields] = @NewFields, [UpdatedAt] = GETUTCDATE()
        WHERE [ProviderId] = @ProviderId;
        
        COMMIT TRAN;
        
        SELECT CAST(1 AS BIT) AS [IsSuccess], 'Custom field deleted successfully.' AS [Result];
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRAN;
            
        SELECT CAST(0 AS BIT) AS [IsSuccess], ERROR_MESSAGE() AS [Result];
    END CATCH;
END;
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetIndicators]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT [value] AS [CountryCode], COUNT(DISTINCT PS.[ProviderId]) AS [ProviderCount], 'ProvidersByCountry' AS [IndicatorType]
    FROM [dbo].[ProviderServices] PS
    CROSS APPLY OPENJSON(PS.[CountryCodes]) 
    WHERE PS.[IsActive] = 1
    GROUP BY [value]
    
    UNION ALL
    
    SELECT [value] AS [CountryCode], COUNT(DISTINCT PS.[ServiceId]) AS [ServiceCount], 'ServicesByCountry' AS [IndicatorType]
    FROM [dbo].[ProviderServices] PS
    CROSS APPLY OPENJSON(PS.[CountryCodes])
    WHERE PS.[IsActive] = 1
    GROUP BY [value]
    ORDER BY [IndicatorType], [CountryCode];
END;
GO