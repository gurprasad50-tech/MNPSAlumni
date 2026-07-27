using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace MnpsAlumni.Api.Functions;

public class MiscFunctions
{
    private readonly Repository _repo;
    public MiscFunctions(Repository repo) => _repo = repo;

    [Function("GetBatches")]
    public async Task<IActionResult> GetBatches(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "batches")] HttpRequest req)
        => new OkObjectResult(await _repo.GetBatchSummariesAsync());

    [Function("GetTimeline")]
    public async Task<IActionResult> GetTimeline(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "timeline")] HttpRequest req)
        => new OkObjectResult(await _repo.GetTimelineAsync());

    [Function("GetDashboard")]
    public async Task<IActionResult> GetDashboard(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "dashboard")] HttpRequest req)
        => new OkObjectResult(await _repo.GetDashboardAsync());
}
