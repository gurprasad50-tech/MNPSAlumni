using Azure;
using Azure.Communication.Email;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace MnpsAlumni.Api.Services;

// Stores generated PDFs in the private 'documents' container.
public sealed class BlobService
{
    private readonly Config _cfg;
    public BlobService(Config cfg) => _cfg = cfg;

    public async Task<string> UploadAsync(string blobName, byte[] bytes, string contentType = "application/pdf")
    {
        var container = new BlobContainerClient(_cfg.Storage, _cfg.DocumentsContainer);
        await container.CreateIfNotExistsAsync(PublicAccessType.None);
        var blob = container.GetBlobClient(blobName);
        using var ms = new MemoryStream(bytes);
        await blob.UploadAsync(ms, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
        });
        return blobName; // stored path; serve later via a short-lived SAS
    }
}

// Sends documents via Azure Communication Services email.
public sealed class EmailService
{
    private readonly Config _cfg;
    public EmailService(Config cfg) => _cfg = cfg;

    public async Task SendWithAttachmentAsync(
        string to, string subject, string html, string attachmentName, byte[] attachment)
    {
        var client = new EmailClient(_cfg.Acs);
        var content = new EmailContent(subject) { Html = html };
        var recipients = new EmailRecipients(new[] { new EmailAddress(to) });
        var message = new EmailMessage(_cfg.Sender, recipients, content);
        message.Attachments.Add(new EmailAttachment(
            attachmentName, "application/pdf", BinaryData.FromBytes(attachment)));
        await client.SendAsync(WaitUntil.Started, message);
    }
}
