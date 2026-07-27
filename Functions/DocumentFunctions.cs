using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using MnpsAlumni.Api.Services;

namespace MnpsAlumni.Api.Functions;

public class DocumentFunctions
{
    private readonly Repository _repo;
    private readonly PdfService _pdf;
    private readonly BlobService _blob;
    private readonly EmailService _email;

    public DocumentFunctions(Repository repo, PdfService pdf, BlobService blob, EmailService email)
    {
        _repo = repo; _pdf = pdf; _blob = blob; _email = email;
    }

    // ---------------- Donations ----------------
    [Function("GetDonations")]
    public async Task<IActionResult> GetDonations(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "donations")] HttpRequest req)
        => new OkObjectResult(await _repo.GetDonationsAsync());

    [Function("CreateDonation")]
    public async Task<IActionResult> CreateDonation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "donations")] HttpRequest req)
    {
        var dto = await Http.ReadBody<CreateDonationDto>(req);
        if (dto is null || dto.AlumniId <= 0 || dto.Amount <= 0 || string.IsNullOrWhiteSpace(dto.Purpose))
            return new BadRequestObjectResult("AlumniId, a positive Amount and Purpose are required.");

        var alum = await _repo.GetAlumnusAsync(dto.AlumniId);
        if (alum is null) return new NotFoundObjectResult("Alumnus not found.");

        var date = dto.Date ?? DateTime.UtcNow;
        var fy = Http.FinancialYear(date);
        var seq = await _repo.NextCounterAsync($"RCPT-{fy}");
        var receiptNo = $"MNPS/R/{fy}/{seq:D4}";

        var donation = new Donation
        {
            AlumniId = alum.Id, Amount = dto.Amount, Purpose = dto.Purpose,
            DonationDate = date, ReceiptNo = receiptNo
        };

        var pdf = _pdf.Receipt(alum, donation);
        donation.ReceiptBlob = await _blob.UploadAsync($"receipts/{receiptNo.Replace('/', '_')}.pdf", pdf);
        donation.Id = await _repo.InsertDonationAsync(donation);

        if (!string.IsNullOrWhiteSpace(alum.Email))
        {
            try
            {
                await _email.SendWithAttachmentAsync(
                    alum.Email!, $"Your donation receipt {receiptNo}",
                    $"<p>Dear {alum.FullName},</p><p>Thank you for your generous contribution towards " +
                    $"{donation.Purpose}. Your official receipt is attached.</p>" +
                    $"<p>{Trust.Name}<br>{Trust.Tagline}</p>",
                    $"Receipt-{seq:D4}.pdf", pdf);
                await _repo.MarkDonationEmailedAsync(donation.Id);
            }
            catch { /* an email failure must not fail the receipt; surfaced in App Insights */ }
        }

        return new OkObjectResult(new { donation.Id, donation.ReceiptNo, donation.ReceiptBlob });
    }

    // ---------------- Certificates ----------------
    [Function("GetCertificates")]
    public async Task<IActionResult> GetCertificates(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "certificates")] HttpRequest req)
        => new OkObjectResult(await _repo.GetCertificatesAsync());

    [Function("IssueCertificate")]
    public async Task<IActionResult> IssueCertificate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "certificates")] HttpRequest req)
    {
        var dto = await Http.ReadBody<IssueCertificateDto>(req);
        if (dto is null || dto.AlumniId <= 0) return new BadRequestResult();

        var alum = await _repo.GetAlumnusAsync(dto.AlumniId);
        if (alum is null) return new NotFoundObjectResult("Alumnus not found.");
        if (!alum.IsRegistered)
            return new BadRequestObjectResult("A certificate can only be issued to a registered member.");
        if (await _repo.CertificateExistsAsync(alum.Id))
            return new ConflictObjectResult("A membership certificate already exists for this member.");

        var year = DateTime.UtcNow.Year;
        var seq = await _repo.NextCounterAsync($"CERT-{year}");
        var certNo = $"MNPS/CERT/{year}/{seq:D4}";

        var cert = new Certificate { AlumniId = alum.Id, CertNo = certNo, IssueDate = DateTime.UtcNow.Date };
        var pdf = _pdf.Certificate(alum, cert);
        cert.CertBlob = await _blob.UploadAsync($"certificates/{certNo.Replace('/', '_')}.pdf", pdf);
        cert.Id = await _repo.InsertCertificateAsync(cert);

        if (!string.IsNullOrWhiteSpace(alum.Email))
        {
            try
            {
                await _email.SendWithAttachmentAsync(
                    alum.Email!, $"Your {Trust.Name} membership certificate",
                    $"<p>Dear {alum.FullName},</p><p>Welcome to the {Trust.Name}. " +
                    "Your membership certificate is attached.</p>" +
                    $"<p>{Trust.Tagline} \u2014 {Trust.Legacy}</p>",
                    $"Certificate-{seq:D4}.pdf", pdf);
                await _repo.MarkCertificateEmailedAsync(cert.Id);
            }
            catch { /* logged via App Insights */ }
        }

        return new OkObjectResult(new { cert.Id, cert.CertNo, cert.CertBlob });
    }
}
