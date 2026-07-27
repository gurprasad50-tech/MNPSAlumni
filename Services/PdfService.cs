using System.Globalization;
using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MnpsAlumni.Api.Services;

public sealed class PdfService
{
    private const string Navy  = "#23425E";
    private const string Ink   = "#152641";
    private const string Brass = "#A37F34";
    private const string Muted = "#6A7688";

    // Uses "Rs." rather than the rupee glyph: the default bundled font may not
    // include U+20B9 on the Linux host, which would render as a blank box.
    private static string Money(decimal n) =>
        "Rs. " + n.ToString("#,##0", CultureInfo.GetCultureInfo("en-IN"));

    // ---------------- Certificate of Membership ----------------
    public byte[] Certificate(Alumnus a, Certificate cert)
    {
        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(28);
                page.DefaultTextStyle(t => t.FontColor(Ink));

                page.Content().Border(2).BorderColor(Brass).Padding(6).Element(inner =>
                {
                    inner.Border(1).BorderColor(Brass).Padding(30).Column(col =>
                    {
                        col.Spacing(6);
                        col.Item().AlignCenter().Text(Trust.Name).FontSize(24).Bold().FontColor(Navy);
                        col.Item().AlignCenter().Text($"{Trust.School} \u00b7 Jamshedpur").FontSize(9).FontColor(Brass);
                        col.Item().PaddingVertical(6).AlignCenter().Width(70).LineHorizontal(1.5f).LineColor(Brass);

                        col.Item().AlignCenter().Text("CERTIFICATE OF MEMBERSHIP").FontSize(11).FontColor(Brass);
                        col.Item().PaddingTop(10).AlignCenter().Text("This is to certify that").FontSize(12).FontColor(Muted);
                        col.Item().AlignCenter().Text(a.FullName).FontSize(30).Bold().FontColor(Navy);
                        col.Item().PaddingHorizontal(60).AlignCenter().Text(
                            $"of the graduating Batch of {a.BatchYear} is a duly registered member of the {Trust.Name}, " +
                            "and is hereby welcomed into the alumni fraternity with all rights and privileges thereof.")
                            .FontSize(12).FontColor("#41505F");
                        col.Item().PaddingTop(8).AlignCenter().Text($"{Trust.Tagline} \u2014 {Trust.Legacy}")
                            .Italic().FontSize(11).FontColor(Brass);

                        col.Item().PaddingTop(28).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text(cert.CertNo).FontSize(11).Bold().FontColor(Ink);
                                c.Item().Text("Membership no.").FontSize(8).FontColor(Muted);
                            });
                            row.RelativeItem().AlignCenter().Column(c =>
                            {
                                c.Item().PaddingBottom(2).Width(150).LineHorizontal(1).LineColor(Ink);
                                c.Item().AlignCenter().Text(Trust.President).FontSize(10);
                                c.Item().AlignCenter().Text("President").FontSize(8).FontColor(Muted);
                            });
                            row.RelativeItem().AlignRight().Column(c =>
                            {
                                c.Item().AlignRight().Text(cert.IssueDate.ToString("dd MMM yyyy")).FontSize(11).Bold();
                                c.Item().AlignRight().Text("Date of issue").FontSize(8).FontColor(Muted);
                            });
                        });
                    });
                });
            });
        }).GeneratePdf();
    }

    // ---------------- Donation Receipt ----------------
    public byte[] Receipt(Alumnus a, Donation d)
    {
        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(t => t.FontSize(11).FontColor(Ink));

                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    col.Item().BorderBottom(2).BorderColor(Brass).PaddingBottom(10).Column(h =>
                    {
                        h.Item().Text(Trust.Name).FontSize(20).Bold().FontColor(Navy);
                        h.Item().Text($"{Trust.School} \u00b7 {Trust.Address}").FontSize(9).FontColor(Muted);
                        h.Item().PaddingTop(4).Text("DONATION RECEIPT").FontSize(10).FontColor(Brass);
                    });

                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Receipt no.").FontSize(9).FontColor(Muted);
                            c.Item().Text(d.ReceiptNo).Bold();
                        });
                        r.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().AlignRight().Text("Date").FontSize(9).FontColor(Muted);
                            c.Item().AlignRight().Text(d.DonationDate.ToString("dd MMM yyyy")).Bold();
                        });
                    });

                    col.Item().Text(txt =>
                    {
                        txt.Span("Received with gratitude from ");
                        txt.Span(a.FullName).Bold();
                        txt.Span($" (Batch of {a.BatchYear}) the sum of ");
                        txt.Span(Money(d.Amount)).Bold();
                        txt.Span(" towards ");
                        txt.Span(d.Purpose).Bold();
                        txt.Span(".");
                    });

                    col.Item().Text($"Rupees {AmountToWords(d.Amount)}").Italic().FontColor(Brass);

                    col.Item().Background("#F0EDE4").Padding(12).Row(r =>
                    {
                        r.RelativeItem().Text("Amount received").FontColor(Muted);
                        r.ConstantItem(160).AlignRight().Text(Money(d.Amount)).FontSize(16).Bold().FontColor(Navy);
                    });

                    var eightyG = string.IsNullOrWhiteSpace(Trust.Reg80G)
                        ? $"{Trust.Name} does not hold 80G registration; this donation is not eligible for income-tax exemption under Section 80G. "
                        : $"Donations to {Trust.Name} are eligible for tax exemption under Section 80G of the Income Tax Act (80G Reg. no. {Trust.Reg80G}). ";
                    col.Item().Text(eightyG +
                        $"Regd. under the Indian Trusts Act, 1882 \u00b7 Reg. no. {Trust.RegNo} \u00b7 PAN {Trust.Pan}. " +
                        "This is a computer-generated receipt.").FontSize(8).FontColor(Muted);

                    col.Item().PaddingTop(24).AlignRight().Column(c =>
                    {
                        c.Item().Width(160).LineHorizontal(1).LineColor(Ink);
                        c.Item().AlignRight().Text($"Authorised Signatory \u00b7 {Trust.Treasurer}").FontSize(9).FontColor(Muted);
                    });

                    col.Item().PaddingTop(6).BorderTop(1).BorderColor("#E4DFD2").PaddingTop(6)
                        .AlignCenter().Text($"{Trust.Phones} \u00b7 {Trust.Email} \u00b7 {Trust.Website}")
                        .FontSize(8).FontColor(Muted);
                });
            });
        }).GeneratePdf();
    }

    public static string AmountToWords(decimal amount)
    {
        long num = (long)Math.Floor(amount);
        if (num == 0) return "Zero Rupees Only";
        string[] a =
        {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        };
        string[] b = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

        string Two(long n) => n < 20 ? a[n] : b[n / 10] + (n % 10 > 0 ? " " + a[n % 10] : "");
        string Three(long n) =>
            (n >= 100 ? a[n / 100] + " Hundred" + (n % 100 > 0 ? " " : "") : "") + (n % 100 > 0 ? Two(n % 100) : "");

        var sb = new StringBuilder();
        long crore = num / 10000000; num %= 10000000;
        long lakh = num / 100000;    num %= 100000;
        long thou = num / 1000;      num %= 1000;
        if (crore > 0) sb.Append(Two(crore)).Append(" Crore ");
        if (lakh > 0)  sb.Append(Two(lakh)).Append(" Lakh ");
        if (thou > 0)  sb.Append(Two(thou)).Append(" Thousand ");
        if (num > 0)   sb.Append(Three(num));
        return sb.ToString().Trim() + " Rupees Only";
    }
}
