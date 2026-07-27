using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MnpsAlumni.Api;
using MnpsAlumni.Api.Services;
using QuestPDF.Infrastructure;

// QuestPDF Community licence: free for organisations under USD 1M revenue (a trust qualifies).
QuestPDF.Settings.License = LicenseType.Community;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddSingleton<Config>();
        services.AddSingleton<Repository>();
        services.AddSingleton<PdfService>();
        services.AddSingleton<BlobService>();
        services.AddSingleton<EmailService>();
    })
    .Build();

host.Run();

namespace MnpsAlumni.Api
{
    // Reads configuration from Function App settings (never hard-code secrets;
    // these are Key Vault references in production).
    public sealed class Config
    {
        public string Sql                => Get("SqlConnectionString");
        public string Storage            => Get("StorageConnectionString");
        public string Acs                => Get("AcsConnectionString");
        public string Sender             => Get("SenderAddress");
        public string DocumentsContainer => Environment.GetEnvironmentVariable("DocumentsContainer") ?? "documents";

        private static string Get(string key) =>
            Environment.GetEnvironmentVariable(key)
            ?? throw new InvalidOperationException($"Missing application setting: {key}");
    }
}
