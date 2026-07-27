# MNPS Alumni Trust — API (Azure Functions, .NET 8 isolated)

Backend for the MNPS Alumni Trust portal. Records alumni, batches and donations,
issues **membership certificates** and **donation receipts** as PDFs (QuestPDF),
stores them in Blob Storage, and emails them via Azure Communication Services.

This is the **standalone Function App** deployment (option 7b): the React front-end
calls this API's URL directly.

## 1. Prerequisites
- .NET 8 SDK
- Azure Functions Core Tools v4 (for local run / `func` publish)
- VS Code (with the Azure Functions extension) or Visual Studio 2022

## 2. Create the database
Run `schema.sql` (in the outputs alongside this project) against
`sqldb-mnps-digitalplatform` using SSMS, Azure Data Studio, or the portal Query
editor. It creates the tables, seeds batch years and the timeline, and is safe to
re-run.

## 3. Run locally
```bash
cp local.settings.json.example local.settings.json   # fill in LOCAL-ONLY values
dotnet restore
func start
```
`local.settings.json` is git-ignored — never commit real secrets.

## 4. Function App settings (in Azure)
Add these under Function App → **Settings → Environment variables** (Application
settings). Store the secret ones in **Key Vault** and reference them:

| Setting | Value |
|---|---|
| `SqlConnectionString` | `@Microsoft.KeyVault(SecretUri=…/sql-conn)` |
| `StorageConnectionString` | `@Microsoft.KeyVault(SecretUri=…/storage-conn)` |
| `AcsConnectionString` | `@Microsoft.KeyVault(SecretUri=…/acs-conn)` |
| `SenderAddress` | `DoNotReply@<subdomain>.azurecomm.net` (from your Email Communication Service) |
| `DocumentsContainer` | `documents` |
| `FUNCTIONS_WORKER_RUNTIME` | `dotnet-isolated` |

The `SenderAddress` domain must be **connected** to your Communication Service
(comm-mnpsalumni-01 → Email → Domains → Connect domain → pick the verified
ecs-mnpsalumni-01 subdomain).

## 5. CORS (required for option 7b)
Function App → **CORS** → add your Static Web App origin:
`https://icy-mushroom-071e78d00.7.azurestaticapps.net`

## 6. Authentication (Entra External ID)
Enable Function App → **Authentication** → add identity provider → Microsoft →
point it at your External ID tenant app registration. Once on, Azure validates every
request before it reaches the code, and the caller's name arrives in the
`X-MS-CLIENT-PRINCIPAL-NAME` header (see `Http.Caller`). Enforce the `Admin` role on
write endpoints as a follow-up.

## 7. Deploy
**Option A — GitHub (recommended):** push this folder to a repo, then Function App →
**Deployment Center** → GitHub → select the repo/branch. Azure wires up the included
`.github/workflows/deploy.yml` and adds the publish-profile secret automatically.

**Option B — direct:**
```bash
func azure functionapp publish func-mnpsalumni-01
```

## 8. Endpoints (all under `/api`)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/alumni` | list alumni |
| GET | `/api/alumni/{id}` | one alumnus |
| POST | `/api/alumni` | add alumnus |
| PUT | `/api/alumni/{id}` | edit alumnus |
| POST | `/api/alumni/{id}/registration` | set paid/unpaid `{ "isRegistered": true }` |
| GET | `/api/batches` | batch summaries (counts + donations) |
| GET | `/api/donations` | list donations |
| POST | `/api/donations` | record donation → PDF receipt → store → email |
| GET | `/api/certificates` | list certificates |
| POST | `/api/certificates` | issue certificate `{ "alumniId": 5 }` → PDF → store → email |
| GET | `/api/timeline` | trust milestones |
| GET | `/api/dashboard` | headline stats |

## Notes
- **Trust details** live in `Models.cs → Trust`. Keep them in sync with the
  front-end `TRUST` config. Two items still need confirming: the **President** name
  (DARPAN lists Anup Raj, not Shazia Raza Khan) and the **80G number** (leave
  `Reg80G` empty until 80G is actually granted — the receipt omits the tax-exempt
  line while it is empty).
- PDFs use "Rs." rather than the ₹ glyph to avoid a missing-glyph box on the Linux
  host. To use ₹, register a font that includes U+20B9 (e.g. Noto Sans) via
  `FontManager.RegisterFont(...)` in `Program.cs`.
- Package versions in the `.csproj` are known-good at time of writing; run
  `dotnet restore` and bump if NuGet reports newer patches.
