using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace MnpsAlumni.Api;

public static class Http
{
    private static readonly JsonSerializerOptions Opts = new() { PropertyNameCaseInsensitive = true };

    public static async Task<T?> ReadBody<T>(HttpRequest req)
    {
        if (req.Body is null) return default;
        return await JsonSerializer.DeserializeAsync<T>(req.Body, Opts);
    }

    // Indian financial year label, e.g. 2026-27 (starts 1 April).
    public static string FinancialYear(DateTime d)
    {
        var start = d.Month >= 4 ? d.Year : d.Year - 1;
        return $"{start}-{(start + 1) % 100:D2}";
    }

    // The signed-in user's name, provided by the Function App's built-in
    // authentication (Easy Auth). Null when auth is not yet enabled.
    public static string? Caller(HttpRequest req) =>
        req.Headers.TryGetValue("X-MS-CLIENT-PRINCIPAL-NAME", out var v) ? v.ToString() : null;
}
