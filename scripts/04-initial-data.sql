USE [TekusDB];
GO

SET IDENTITY_INSERT [dbo].[Providers] ON;

INSERT INTO [dbo].[Providers] ([ProviderId], [Nit], [ProviderName], [Email], [CustomFields], [IsActive], [CreatedAt])
VALUES 
(1, '900123456-1', 'Importaciones Tekus S.A.', 'contacto@importacionestekus.com', '{"Numero de contacto en marte": "+1-MARS-2024", "Cantidad de mascotas en la nomina": "3"}', 1, GETUTCDATE()),
(2, '900234567-2', 'TechSolutions Colombia', 'info@techsolutions.co', '{"Oficina principal": "Bogota", "Anos de experiencia": "15"}', 1, GETUTCDATE()),
(3, '900345678-3', 'DataServices Peru SAC', 'ventas@dataservices.pe', '{}', 1, GETUTCDATE()),
(4, '900456789-4', 'CloudExperts Mexico', 'contacto@cloudexperts.mx', '{"Certificaciones": "AWS, Azure, GCP"}', 1, GETUTCDATE()),
(5, '900567890-5', 'SecureNet Chile', 'info@securenet.cl', '{}', 1, GETUTCDATE()),
(6, '900678901-6', 'InnovateTech Argentina', 'sales@innovatetech.ar', '{"Clientes activos": "250"}', 1, GETUTCDATE()),
(7, '900789012-7', 'DigitalWave Brasil', 'contato@digitalwave.br', '{}', 1, GETUTCDATE()),
(8, '900890123-8', 'SmartSystems Ecuador', 'info@smartsystems.ec', '{}', 1, GETUTCDATE()),
(9, '900901234-9', 'TeknoServices Uruguay', 'ventas@teknoservices.uy', '{}', 1, GETUTCDATE()),
(10, '900012345-0', 'GlobalIT Venezuela', 'contacto@globalit.ve', '{}', 1, GETUTCDATE()),
(11, '900123450-1', 'ByteMasters Costa Rica', 'info@bytemasters.cr', '{}', 1, GETUTCDATE()),
(12, '900234561-2', 'CodeFactory Panama', 'ventas@codefactory.pa', '{}', 1, GETUTCDATE()),
(13, '900345672-3', 'DevOps Guatemala', 'info@devops.gt', '{}', 1, GETUTCDATE()),
(14, '900456783-4', 'CloudNine Honduras', 'contacto@cloudnine.hn', '{}', 1, GETUTCDATE()),
(15, '900567894-5', 'TechHub El Salvador', 'info@techhub.sv', '{}', 1, GETUTCDATE());

SET IDENTITY_INSERT [dbo].[Providers] OFF;
GO

SET IDENTITY_INSERT [dbo].[Services] ON;

INSERT INTO [dbo].[Services] ([ServiceId], [ServiceName], [HourlyRateUSD], [Description], [IsActive], [CreatedAt])
VALUES 
(1, 'Descarga espacial de contenidos', 150.00, 'Servicio de descarga optimizada de contenido digital', 1, GETUTCDATE()),
(2, 'Desaparicion forzada de bytes', 85.50, 'Eliminacion segura y permanente de datos', 1, GETUTCDATE()),
(3, 'Desarrollo de aplicaciones web', 120.00, 'Desarrollo full-stack de aplicaciones web modernas', 1, GETUTCDATE()),
(4, 'Consultoria en arquitectura cloud', 200.00, 'Diseno e implementacion de soluciones cloud', 1, GETUTCDATE()),
(5, 'Analisis de datos y Big Data', 180.00, 'Analisis avanzado de datos empresariales', 1, GETUTCDATE()),
(6, 'Ciberseguridad y pentesting', 250.00, 'Auditorias de seguridad y pruebas de penetracion', 1, GETUTCDATE()),
(7, 'DevOps y CI/CD', 160.00, 'Implementacion de pipelines de integracion continua', 1, GETUTCDATE()),
(8, 'Inteligencia Artificial y ML', 220.00, 'Desarrollo de modelos de machine learning', 1, GETUTCDATE()),
(9, 'Desarrollo movil nativo', 140.00, 'Desarrollo de apps para iOS y Android', 1, GETUTCDATE()),
(10, 'Soporte tecnico 24/7', 95.00, 'Soporte tecnico continuo', 1, GETUTCDATE()),
(11, 'Migracion a la nube', 175.00, 'Migracion de infraestructura on-premise a cloud', 1, GETUTCDATE()),
(12, 'Blockchain y Web3', 300.00, 'Desarrollo de soluciones blockchain', 1, GETUTCDATE());

SET IDENTITY_INSERT [dbo].[Services] OFF;
GO

SET IDENTITY_INSERT [dbo].[ProviderServices] ON;

INSERT INTO [dbo].[ProviderServices] ([ProviderServiceId], [ProviderId], [ServiceId], [CountryCodes], [IsActive], [CreatedAt])
VALUES 
(1, 1, 1, '["CO","PE","MX"]', 1, GETUTCDATE()),
(2, 1, 2, '["CO","PE","MX"]', 1, GETUTCDATE()),
(3, 2, 3, '["CO","EC","PA"]', 1, GETUTCDATE()),
(4, 2, 4, '["CO","CL","AR"]', 1, GETUTCDATE()),
(5, 3, 5, '["PE","BO","EC"]', 1, GETUTCDATE()),
(6, 4, 6, '["MX","US","CA"]', 1, GETUTCDATE()),
(7, 4, 7, '["MX","GT","HN"]', 1, GETUTCDATE()),
(8, 5, 6, '["CL","AR","UY"]', 1, GETUTCDATE()),
(9, 6, 8, '["AR","BR","PY"]', 1, GETUTCDATE()),
(10, 7, 9, '["BR","PT"]', 1, GETUTCDATE()),
(11, 8, 3, '["EC","CO","VE"]', 1, GETUTCDATE()),
(12, 9, 10, '["UY","AR","CL"]', 1, GETUTCDATE()),
(13, 10, 11, '["VE","CO"]', 1, GETUTCDATE()),
(14, 11, 4, '["CR","NI","PA"]', 1, GETUTCDATE()),
(15, 12, 7, '["PA","CO","CR"]', 1, GETUTCDATE()),
(16, 13, 3, '["GT","SV","HN"]', 1, GETUTCDATE()),
(17, 14, 10, '["HN","NI","SV"]', 1, GETUTCDATE()),
(18, 15, 12, '["SV","GT","CR"]', 1, GETUTCDATE()),
(19, 1, 4, '["CO","MX"]', 1, GETUTCDATE()),
(20, 3, 8, '["PE","CL","AR"]', 1, GETUTCDATE());

SET IDENTITY_INSERT [dbo].[ProviderServices] OFF;
GO

SELECT 'Providers' AS Tabla, COUNT(*) AS Registros FROM [dbo].[Providers] WHERE [IsActive] = 1
UNION ALL
SELECT 'Services', COUNT(*) FROM [dbo].[Services] WHERE [IsActive] = 1
UNION ALL
SELECT 'ProviderServices', COUNT(*) FROM [dbo].[ProviderServices] WHERE [IsActive] = 1;
GO