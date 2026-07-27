using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace MnpsAlumni.Api.Functions;

public class AlumniFunctions
{
    private readonly Repository _repo;
    public AlumniFunctions(Repository repo) => _repo = repo;

    [Function("GetAlumni")]
    public async Task<IActionResult> GetAll(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "alumni")] HttpRequest req)
        => new OkObjectResult(await _repo.GetAlumniAsync());

    [Function("GetAlumnus")]
    public async Task<IActionResult> Get(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "alumni/{id:int}")] HttpRequest req, int id)
    {
        var a = await _repo.GetAlumnusAsync(id);
        return a is null ? new NotFoundResult() : new OkObjectResult(a);
    }

    [Function("CreateAlumnus")]
    public async Task<IActionResult> Create(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "alumni")] HttpRequest req)
    {
        var dto = await Http.ReadBody<AlumnusDto>(req);
        if (dto is null || string.IsNullOrWhiteSpace(dto.FullName) || dto.BatchYear < 1900)
            return new BadRequestObjectResult("FullName and a valid BatchYear are required.");
        var id = await _repo.InsertAlumnusAsync(dto);
        return new OkObjectResult(new { id });
    }

    [Function("UpdateAlumnus")]
    public async Task<IActionResult> Update(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "alumni/{id:int}")] HttpRequest req, int id)
    {
        var dto = await Http.ReadBody<AlumnusDto>(req);
        if (dto is null) return new BadRequestResult();
        var ok = await _repo.UpdateAlumnusAsync(id, dto);
        return ok ? new OkResult() : new NotFoundResult();
    }

    [Function("SetRegistration")]
    public async Task<IActionResult> SetRegistration(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "alumni/{id:int}/registration")] HttpRequest req, int id)
    {
        var dto = await Http.ReadBody<RegistrationDto>(req);
        if (dto is null) return new BadRequestResult();
        var ok = await _repo.SetRegistrationAsync(id, dto.IsRegistered);
        return ok ? new OkResult() : new NotFoundResult();
    }
}
