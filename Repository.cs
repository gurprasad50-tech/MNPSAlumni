using Dapper;
using Microsoft.Data.SqlClient;

namespace MnpsAlumni.Api;

public sealed class Repository
{
    private readonly Config _cfg;
    public Repository(Config cfg) => _cfg = cfg;

    private SqlConnection Conn() => new(_cfg.Sql);

    // ---------- Alumni ----------
    public async Task<IEnumerable<Alumnus>> GetAlumniAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<Alumnus>(
            "SELECT Id, FullName, BatchYear, OccupationType, Organisation, Role, City, Country, " +
            "MaritalStatus, Email, Phone, Bio, PhotoUrl, IsRegistered, JoinDate " +
            "FROM dbo.Alumni ORDER BY BatchYear, FullName");
    }

    public async Task<Alumnus?> GetAlumnusAsync(int id)
    {
        using var c = Conn();
        return await c.QuerySingleOrDefaultAsync<Alumnus>(
            "SELECT Id, FullName, BatchYear, OccupationType, Organisation, Role, City, Country, " +
            "MaritalStatus, Email, Phone, Bio, PhotoUrl, IsRegistered, JoinDate " +
            "FROM dbo.Alumni WHERE Id = @id", new { id });
    }

    public async Task<int> InsertAlumnusAsync(AlumnusDto a)
    {
        using var c = Conn();
        await c.OpenAsync();
        // Make sure the batch row exists (FK).
        await c.ExecuteAsync(
            "IF NOT EXISTS (SELECT 1 FROM dbo.Batches WHERE BatchYear=@BatchYear) " +
            "INSERT dbo.Batches(BatchYear) VALUES(@BatchYear)", new { a.BatchYear });

        return await c.ExecuteScalarAsync<int>(
            "INSERT dbo.Alumni (FullName, BatchYear, OccupationType, Organisation, Role, City, Country, " +
            "MaritalStatus, Email, Phone, Bio, IsRegistered) " +
            "OUTPUT inserted.Id VALUES (@FullName, @BatchYear, @OccupationType, @Organisation, @Role, @City, " +
            "@Country, @MaritalStatus, @Email, @Phone, @Bio, @IsRegistered)", a);
    }

    public async Task<bool> UpdateAlumnusAsync(int id, AlumnusDto a)
    {
        using var c = Conn();
        var rows = await c.ExecuteAsync(
            "UPDATE dbo.Alumni SET FullName=@FullName, BatchYear=@BatchYear, OccupationType=@OccupationType, " +
            "Organisation=@Organisation, Role=@Role, City=@City, Country=@Country, MaritalStatus=@MaritalStatus, " +
            "Email=@Email, Phone=@Phone, Bio=@Bio, IsRegistered=@IsRegistered, UpdatedAt=SYSUTCDATETIME() " +
            "WHERE Id=@id",
            new { id, a.FullName, a.BatchYear, a.OccupationType, a.Organisation, a.Role, a.City, a.Country,
                  a.MaritalStatus, a.Email, a.Phone, a.Bio, a.IsRegistered });
        return rows > 0;
    }

    public async Task<bool> SetRegistrationAsync(int id, bool isRegistered)
    {
        using var c = Conn();
        var rows = await c.ExecuteAsync(
            "UPDATE dbo.Alumni SET IsRegistered=@isRegistered, UpdatedAt=SYSUTCDATETIME() WHERE Id=@id",
            new { id, isRegistered });
        return rows > 0;
    }

    // ---------- Batches ----------
    public async Task<IEnumerable<BatchSummary>> GetBatchSummariesAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<BatchSummary>(@"
            SELECT a.BatchYear                                   AS BatchYear,
                   COUNT(*)                                      AS Total,
                   SUM(CASE WHEN a.IsRegistered = 1 THEN 1 ELSE 0 END) AS Registered,
                   ISNULL((SELECT SUM(d.Amount) FROM dbo.Donations d
                           JOIN dbo.Alumni x ON x.Id = d.AlumniId
                           WHERE x.BatchYear = a.BatchYear), 0)  AS Donations
            FROM dbo.Alumni a
            GROUP BY a.BatchYear
            ORDER BY a.BatchYear");
    }

    // ---------- Donations ----------
    public async Task<IEnumerable<Donation>> GetDonationsAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<Donation>(
            "SELECT Id, AlumniId, Amount, Purpose, DonationDate, ReceiptNo, ReceiptBlob, EmailedAt " +
            "FROM dbo.Donations ORDER BY DonationDate DESC, Id DESC");
    }

    public async Task<int> InsertDonationAsync(Donation d)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "INSERT dbo.Donations (AlumniId, Amount, Purpose, DonationDate, ReceiptNo, ReceiptBlob) " +
            "OUTPUT inserted.Id VALUES (@AlumniId, @Amount, @Purpose, @DonationDate, @ReceiptNo, @ReceiptBlob)", d);
    }

    public async Task MarkDonationEmailedAsync(int id)
    {
        using var c = Conn();
        await c.ExecuteAsync("UPDATE dbo.Donations SET EmailedAt=SYSUTCDATETIME() WHERE Id=@id", new { id });
    }

    // ---------- Certificates ----------
    public async Task<IEnumerable<Certificate>> GetCertificatesAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<Certificate>(
            "SELECT Id, AlumniId, CertNo, IssueDate, CertBlob, EmailedAt " +
            "FROM dbo.Certificates ORDER BY IssueDate DESC, Id DESC");
    }

    public async Task<bool> CertificateExistsAsync(int alumniId)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.Certificates WHERE AlumniId=@alumniId", new { alumniId }) > 0;
    }

    public async Task<int> InsertCertificateAsync(Certificate cert)
    {
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(
            "INSERT dbo.Certificates (AlumniId, CertNo, IssueDate, CertBlob) " +
            "OUTPUT inserted.Id VALUES (@AlumniId, @CertNo, @IssueDate, @CertBlob)", cert);
    }

    public async Task MarkCertificateEmailedAsync(int id)
    {
        using var c = Conn();
        await c.ExecuteAsync("UPDATE dbo.Certificates SET EmailedAt=SYSUTCDATETIME() WHERE Id=@id", new { id });
    }

    // ---------- Timeline ----------
    public async Task<IEnumerable<TimelineItem>> GetTimelineAsync()
    {
        using var c = Conn();
        return await c.QueryAsync<TimelineItem>(
            "SELECT Id, [Year] AS Year, Title, Description, SortOrder " +
            "FROM dbo.TimelineMilestones ORDER BY SortOrder, [Year]");
    }

    // ---------- Dashboard ----------
    public async Task<DashboardStats> GetDashboardAsync()
    {
        using var c = Conn();
        using var grid = await c.QueryMultipleAsync(@"
            SELECT COUNT(*)                                            AS TotalAlumni,
                   SUM(CASE WHEN IsRegistered=1 THEN 1 ELSE 0 END)     AS Registered,
                   COUNT(DISTINCT BatchYear)                           AS Batches
            FROM dbo.Alumni;
            SELECT ISNULL(SUM(Amount),0) AS TotalDonations,
                   COUNT(DISTINCT AlumniId) AS Donors
            FROM dbo.Donations;
            SELECT COUNT(*) AS Certificates FROM dbo.Certificates;");

        var a = await grid.ReadSingleAsync();
        var d = await grid.ReadSingleAsync();
        int certs = await grid.ReadSingleAsync<int>();

        int total = (int)a.TotalAlumni;
        int reg = (int)(a.Registered ?? 0);
        return new DashboardStats
        {
            TotalAlumni = total,
            Registered = reg,
            Unregistered = total - reg,
            Batches = (int)a.Batches,
            TotalDonations = (decimal)d.TotalDonations,
            Donors = (int)d.Donors,
            Certificates = certs
        };
    }

    // ---------- Numbering (atomic) ----------
    public async Task<int> NextCounterAsync(string key)
    {
        using var c = Conn();
        await c.OpenAsync();
        using var tx = c.BeginTransaction();
        var val = await c.ExecuteScalarAsync<int?>(
            "UPDATE dbo.Counters WITH (UPDLOCK, HOLDLOCK) SET NextValue = NextValue + 1 " +
            "OUTPUT inserted.NextValue WHERE CounterKey = @key", new { key }, tx);
        if (val is null)
        {
            await c.ExecuteAsync("INSERT dbo.Counters(CounterKey, NextValue) VALUES(@key, 1)", new { key }, tx);
            val = 1;
        }
        tx.Commit();
        return val.Value;
    }
}
