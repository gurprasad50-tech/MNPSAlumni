namespace MnpsAlumni.Api;

// ---- Trust identity (mirrors the front-end TRUST config; keep the two in sync) ----
public static class Trust
{
    public const string Name      = "MNPS Alumni Trust";
    public const string School    = "Motilal Nehru Public School";
    public const string Tagline   = "Unite to Ignite";
    public const string Legacy    = "The MNPS legacy lives on";
    public const string Address   = "MNPS Campus, Northern Town, Bistupur, Jamshedpur, Jharkhand \u2013 831001";
    public const string Phones    = "+91 98247 16129 \u00b7 +91 86032 29055";
    public const string Email     = "mnpsalumnitrust@gmail.com";
    public const string Website   = "www.mnpsalumni.com";
    public const string RegNo     = "2025/JSR/1730/BK4/137";
    public const string Pan       = "AAKTM0976H";
    public const string Darpan    = "JH/2025/0649469";
    public const string Reg80G    = "";                 // set once 80G is granted
    public const string President = "Shazia Raza Khan";  // CONFIRM against DARPAN (Anup Raj)
    public const string Treasurer = "Gurprasad Singh Sokhi";
}

// ---- Entities ----
public class Alumnus
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public int BatchYear { get; set; }
    public string OccupationType { get; set; } = "Job";
    public string? Organisation { get; set; }
    public string? Role { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; } = "India";
    public string? MaritalStatus { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsRegistered { get; set; }
    public DateTime JoinDate { get; set; }
}

public class Donation
{
    public int Id { get; set; }
    public int AlumniId { get; set; }
    public decimal Amount { get; set; }
    public string Purpose { get; set; } = "";
    public DateTime DonationDate { get; set; }
    public string ReceiptNo { get; set; } = "";
    public string? ReceiptBlob { get; set; }
    public DateTime? EmailedAt { get; set; }
}

public class Certificate
{
    public int Id { get; set; }
    public int AlumniId { get; set; }
    public string CertNo { get; set; } = "";
    public DateTime IssueDate { get; set; }
    public string? CertBlob { get; set; }
    public DateTime? EmailedAt { get; set; }
}

public class TimelineItem
{
    public int Id { get; set; }
    public string Year { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public int SortOrder { get; set; }
}

// ---- Read models ----
public class BatchSummary
{
    public int BatchYear { get; set; }
    public int Total { get; set; }
    public int Registered { get; set; }
    public decimal Donations { get; set; }
}

public class DashboardStats
{
    public int TotalAlumni { get; set; }
    public int Registered { get; set; }
    public int Unregistered { get; set; }
    public decimal TotalDonations { get; set; }
    public int Donors { get; set; }
    public int Batches { get; set; }
    public int Certificates { get; set; }
}

// ---- Request DTOs ----
public record AlumnusDto(
    string FullName, int BatchYear, string OccupationType, string? Organisation,
    string? Role, string? City, string? Country, string? MaritalStatus,
    string? Email, string? Phone, string? Bio, bool IsRegistered);

public record RegistrationDto(bool IsRegistered);

public record CreateDonationDto(int AlumniId, decimal Amount, string Purpose, DateTime? Date);

public record IssueCertificateDto(int AlumniId);
