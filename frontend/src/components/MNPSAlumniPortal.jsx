import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
    LayoutDashboard, Users, GraduationCap, HeartHandshake, Award, History,
    Search, Plus, MapPin, Briefcase, Building2, Heart, X, Printer, Menu,
    CheckCircle2, Circle, Landmark, Mail, Phone, Calendar, IndianRupee, RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MNPS Alumni Trust - Admin Portal                                   */
/*  Talks to the Azure Functions API. Set API_BASE to your Function    */
/*  App URL (or inject it at build time via an env var).               */
/* ------------------------------------------------------------------ */

const API_BASE = "https://func-mnpsalumni-01-h9hjbza4fscbbuaw.eastasia-01.azurewebsites.net/api";

const TRUST = {
    name: "MNPS Alumni Trust",
    school: "Motilal Nehru Public School",
    tagline: "Unite to Ignite",
    legacy: "The MNPS legacy lives on",
    address: "MNPS Campus, Northern Town, Bistupur, Jamshedpur, Jharkhand \u2013 831001",
    phones: "+91 98247 16129 \u00b7 +91 86032 29055",
    email: "mnpsalumnitrust@gmail.com",
    website: "www.mnpsalumni.com",
    instagram: "@MNPSALUMNI",
    estd: 2025,
    darpan: "JH/2025/0649469",
    regNo: "2025/JSR/1730/BK4/137",
    pan: "AAKTM0976H",
    reg80G: "",
    president: "Shazia Raza Khan",
    treasurer: "Gurprasad Singh Sokhi",
};

/* Your transparent PNG logo. Place the file in the Static Web App repo at
   public/logo.png  ->  it is served from the site root as /logo.png. */
const LOGO_SRC = "/logo.png";

/* deterministic colour per batch year (works for any year from the DB) */
const PALETTE = ["#3f5a72", "#5f6a86", "#6a5f78", "#7a6a56", "#4f6f6a", "#8a6a4c", "#48607a", "#736560"];
const batchColor = (year) => PALETTE[Math.abs(Number(year) || 0) % PALETTE.length];

/* ---------- API helper + field mapping ---------- */
async function api(method, path, body) {
    const res = await fetch(API_BASE + path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}${t ? " - " + t : ""}`);
    }
    if (res.status === 204) return null;
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}

const mapAlumnus = (a) => ({
    id: a.id, name: a.fullName, batch: a.batchYear, occ: a.occupationType,
    org: a.organisation || "", role: a.role || "", city: a.city || "", country: a.country || "",
    marital: a.maritalStatus || "", email: a.email || "", phone: a.phone || "",
    bio: a.bio || "", paid: a.isRegistered, join: a.joinDate,
});
const mapDonation = (d) => ({ id: d.id, alumniId: d.alumniId, amount: d.amount, purpose: d.purpose, date: d.donationDate, receiptNo: d.receiptNo });
const mapCert = (c) => ({ id: c.id, alumniId: c.alumniId, certNo: c.certNo, date: c.issueDate });
const mapTimeline = (t) => ({ year: t.year, title: t.title, text: t.description || "" });

/* ---------- formatting helpers ---------- */
const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

function amountToWords(num) {
    num = Math.floor(num || 0);
    if (num === 0) return "Zero Rupees Only";
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const two = (n) => (n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : ""));
    const three = (n) => (n >= 100 ? a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " : "") : "") + (n % 100 ? two(n % 100) : "");
    let str = "";
    const crore = Math.floor(num / 10000000); num %= 10000000;
    const lakh = Math.floor(num / 100000); num %= 100000;
    const thou = Math.floor(num / 1000); num %= 1000;
    if (crore) str += two(crore) + " Crore ";
    if (lakh) str += two(lakh) + " Lakh ";
    if (thou) str += two(thou) + " Thousand ";
    if (num) str += three(num);
    return str.trim() + " Rupees Only";
}

/* ---------- crest / seal / avatar ---------- */
function Crest({ size = 64, chip = false }) {
    return (
        <img
            src={LOGO_SRC}
            alt="MNPS Alumni Trust"
            className={chip ? "crest chip" : "crest"}
            style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
        />
    );
}

function Seal({ size = 88, id = "seal" }) {
    const r = size / 2, pr = r - 12;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs><path id={id} d={`M ${r},${r} m -${pr},0 a ${pr},${pr} 0 1,1 ${pr * 2},0 a ${pr},${pr} 0 1,1 -${pr * 2},0`} fill="none" /></defs>
            <circle cx={r} cy={r} r={r - 2} fill="none" stroke="var(--brass)" strokeWidth="1.5" />
            <circle cx={r} cy={r} r={r - 7} fill="none" stroke="var(--brass)" strokeWidth="0.75" />
            <text fontSize={size * 0.085} letterSpacing="1.5" fill="var(--brass)" fontFamily="'IBM Plex Mono', monospace">
                <textPath href={`#${id}`} startOffset="2%">MNPS ALUMNI TRUST · EST. 2015 · REGD. SOCIETY ·</textPath>
            </text>
            <text x={r} y={r - 3} textAnchor="middle" fontSize={size * 0.26} fill="var(--brass)" fontFamily="'Fraunces', serif" fontWeight="600">M</text>
            <text x={r} y={r + size * 0.17} textAnchor="middle" fontSize={size * 0.085} letterSpacing="2" fill="var(--brass)" fontFamily="'IBM Plex Mono', monospace">✦ ✦ ✦</text>
        </svg>
    );
}

function Avatar({ name, batch, size = 40 }) {
    return <div className="avatar" style={{ width: size, height: size, background: batchColor(batch), fontSize: size * 0.36 }}>{initials(name)}</div>;
}
function Tag({ paid }) {
    return <span className={paid ? "tag tag-paid" : "tag tag-unpaid"}>{paid ? "Registered" : "Unregistered"}</span>;
}

/* ================================================================== */
export default function App() {
    const [view, setView] = useState("dashboard");
    const [menuOpen, setMenuOpen] = useState(false);
    const [alumni, setAlumni] = useState([]);
    const [donations, setDonations] = useState([]);
    const [certs, setCerts] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [banner, setBanner] = useState(null);
    const [modal, setModal] = useState(null);
    const [query, setQuery] = useState("");
    const [batchFilter, setBatchFilter] = useState("all");
    const [paidFilter, setPaidFilter] = useState("all");

    // make sure the page is mobile-scaled even if index.html lacks a viewport tag
    useEffect(() => {
        let m = document.querySelector('meta[name="viewport"]');
        if (!m) { m = document.createElement("meta"); m.name = "viewport"; document.head.appendChild(m); }
        m.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [al, dn, ct, tl] = await Promise.all([
                api("GET", "/alumni"), api("GET", "/donations"),
                api("GET", "/certificates"), api("GET", "/timeline"),
            ]);
            setAlumni((al || []).map(mapAlumnus));
            setDonations((dn || []).map(mapDonation));
            setCerts((ct || []).map(mapCert));
            setTimeline((tl || []).map(mapTimeline));
        } catch (e) {
            setError(e.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { loadAll(); }, [loadAll]);

    const reloadAlumni = async () => setAlumni((await api("GET", "/alumni")).map(mapAlumnus));
    const reloadDonations = async () => setDonations((await api("GET", "/donations")).map(mapDonation));
    const reloadCerts = async () => setCerts((await api("GET", "/certificates")).map(mapCert));

    const notify = (text, isError = false) => { setBanner({ text, isError }); setTimeout(() => setBanner(null), 3800); };

    const batches = useMemo(() => [...new Set(alumni.map((a) => a.batch))].sort((x, y) => x - y), [alumni]);
    const alumniById = (id) => alumni.find((a) => a.id === id);

    const stats = useMemo(() => {
        const total = alumni.length;
        const paid = alumni.filter((a) => a.paid).length;
        const totalDon = donations.reduce((s, d) => s + d.amount, 0);
        const donors = new Set(donations.map((d) => d.alumniId)).size;
        return { total, paid, unpaid: total - paid, totalDon, donors, batches: batches.length, certs: certs.length };
    }, [alumni, donations, certs, batches]);

    const byBatch = useMemo(() =>
        batches.map((b) => {
            const mem = alumni.filter((a) => a.batch === b);
            const don = donations.filter((d) => alumniById(d.alumniId)?.batch === b).reduce((s, d) => s + d.amount, 0);
            return { batch: String(b), paid: mem.filter((m) => m.paid).length, unpaid: mem.filter((m) => !m.paid).length, total: mem.length, don };
        }), [alumni, donations, batches]);

    const filteredAlumni = useMemo(() =>
        alumni.filter((a) => {
            const q = query.trim().toLowerCase();
            const matchQ = !q || a.name.toLowerCase().includes(q) || a.org.toLowerCase().includes(q) || a.city.toLowerCase().includes(q);
            const matchB = batchFilter === "all" || a.batch === Number(batchFilter);
            const matchP = paidFilter === "all" || (paidFilter === "paid" ? a.paid : !a.paid);
            return matchQ && matchB && matchP;
        }), [alumni, query, batchFilter, paidFilter]);

    /* ---- actions (all hit the API) ---- */
    const recordDonation = async (form) => {
        try {
            const res = await api("POST", "/donations", { alumniId: Number(form.alumniId), amount: Number(form.amount), purpose: form.purpose, date: form.date });
            await reloadDonations();
            setModal({ type: "receipt", data: { alumniId: Number(form.alumniId), amount: Number(form.amount), purpose: form.purpose, date: form.date, receiptNo: res.receiptNo } });
            notify(`Receipt ${res.receiptNo} issued`);
        } catch (e) { notify(e.message, true); }
    };
    const issueCert = async (alumniId) => {
        try {
            const res = await api("POST", "/certificates", { alumniId: Number(alumniId) });
            await reloadCerts();
            setModal({ type: "certificate", data: { alumniId: Number(alumniId), certNo: res.certNo, date: new Date().toISOString().slice(0, 10) } });
            notify(`Certificate ${res.certNo} issued`);
        } catch (e) { notify(e.message, true); }
    };
    const togglePaid = async (id) => {
        const a = alumniById(id); if (!a) return;
        try { await api("POST", `/alumni/${id}/registration`, { isRegistered: !a.paid }); await reloadAlumni(); }
        catch (e) { notify(e.message, true); }
    };
    const addAlumnus = async (form) => {
        try {
            await api("POST", "/alumni", {
                fullName: form.name, batchYear: Number(form.batch), occupationType: form.occ,
                organisation: form.org, role: form.role, city: form.city, country: form.country,
                maritalStatus: form.marital, email: form.email, phone: form.phone, bio: form.bio,
                isRegistered: form.paid === "true",
            });
            await reloadAlumni();
            setModal(null); go("alumni");
            notify("Alumnus added");
        } catch (e) { notify(e.message, true); }
    };

    const go = (v) => { setView(v); setMenuOpen(false); };

    const NAV = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "alumni", label: "Alumni", icon: Users },
        { id: "batches", label: "Batches", icon: GraduationCap },
        { id: "donations", label: "Donations", icon: HeartHandshake },
        { id: "certificates", label: "Certificates", icon: Award },
        { id: "timeline", label: "Trust Timeline", icon: History },
    ];
    const titles = { dashboard: "Dashboard", alumni: "Alumni Directory", batches: "Batches", donations: "Donations & Receipts", certificates: "Membership Certificates", timeline: "Trust Timeline" };

    /* ================= VIEWS ================= */
    const renderDashboard = () => (
        <>
            <div className="stat-grid">
                <StatCard label="Total Alumni" value={stats.total} sub={`${stats.batches} batches`} icon={Users} />
                <StatCard label="Registered Members" value={stats.paid} sub={stats.total ? `${Math.round((stats.paid / stats.total) * 100)}% of alumni` : "\u2014"} icon={CheckCircle2} accent />
                <StatCard label="Total Donations" value={inr(stats.totalDon)} sub={`${stats.donors} donors`} icon={IndianRupee} />
                <StatCard label="Certificates Issued" value={stats.certs} sub="membership certificates" icon={Award} />
            </div>

            <div className="two-col">
                <div className="panel">
                    <div className="panel-head"><h3>Members by batch</h3><span className="muted">Registered vs unregistered</span></div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byBatch} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e6e1d5" vertical={false} />
                                <XAxis dataKey="batch" tick={{ fontSize: 12, fill: "#6a7688" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#6a7688" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2ddd0", fontSize: 13 }} />
                                <Bar dataKey="paid" stackId="a" fill="var(--ink)" name="Registered" />
                                <Bar dataKey="unpaid" stackId="a" fill="var(--brass)" name="Unregistered" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-head"><h3>Donations by batch</h3><span className="muted">Total contributed</span></div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byBatch} margin={{ top: 8, right: 8, left: 6, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e6e1d5" vertical={false} />
                                <XAxis dataKey="batch" tick={{ fontSize: 12, fill: "#6a7688" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#6a7688" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 100000 ? `${v / 100000}L` : v / 1000 + "k"} />
                                <Tooltip formatter={(v) => inr(v)} contentStyle={{ borderRadius: 10, border: "1px solid #e2ddd0", fontSize: 13 }} />
                                <Bar dataKey="don" name="Donations" radius={[4, 4, 0, 0]}>
                                    {byBatch.map((e, i) => <Cell key={i} fill={batchColor(e.batch)} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-head"><h3>Recent donations</h3><button className="btn-ghost" onClick={() => go("donations")}>View all</button></div>
                <div className="table-wrap">
                    <table className="table">
                        <thead><tr><th>Receipt no.</th><th>Donor</th><th>Batch</th><th>Purpose</th><th className="right">Amount</th><th>Date</th></tr></thead>
                        <tbody>
                            {donations.slice(0, 5).map((d) => {
                                const a = alumniById(d.alumniId);
                                return <tr key={d.id}><td className="mono">{d.receiptNo}</td><td>{a?.name}</td><td>{a?.batch}</td><td>{d.purpose}</td><td className="right mono">{inr(d.amount)}</td><td className="muted">{fmtDate(d.date)}</td></tr>;
                            })}
                            {donations.length === 0 && <tr><td colSpan={6} className="empty">No donations recorded yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderAlumni = () => (
        <>
            <div className="toolbar">
                <div className="search"><Search size={16} /><input placeholder="Search name, organisation or city" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
                <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
                    <option value="all">All batches</option>
                    {batches.map((b) => <option key={b} value={b}>Batch of {b}</option>)}
                </select>
                <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
                    <option value="all">All members</option><option value="paid">Registered</option><option value="unpaid">Unregistered</option>
                </select>
                <span className="count">{filteredAlumni.length} shown</span>
                <button className="btn" onClick={() => setModal({ type: "addAlumni" })}><Plus size={16} /> Add alumnus</button>
            </div>
            {alumni.length === 0
                ? <div className="empty-state"><Users size={30} /><p>No alumni yet. Add your first member, or load the sample data with <code>seed-data.sql</code>.</p></div>
                : (
                    <div className="card-grid">
                        {filteredAlumni.map((a) => (
                            <div key={a.id} className="alumni-card" onClick={() => setModal({ type: "alumniDetail", data: a })}>
                                <div className="ac-top">
                                    <Avatar name={a.name} batch={a.batch} size={52} />
                                    <div className="ac-id"><h4>{a.name}</h4><span className="batch-chip" style={{ color: batchColor(a.batch) }}>Batch of {a.batch}</span></div>
                                    <Tag paid={a.paid} />
                                </div>
                                <div className="ac-meta">
                                    <span>{a.occ === "Business" ? <Building2 size={14} /> : <Briefcase size={14} />}{a.role}{a.role && a.org ? ", " : ""}{a.org}</span>
                                    <span><MapPin size={14} />{a.city}{a.city && a.country ? ", " : ""}{a.country}</span>
                                    <span><Heart size={14} />{a.marital || "\u2014"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </>
    );

    const renderBatches = () => (
        byBatch.length === 0
            ? <div className="empty-state"><GraduationCap size={30} /><p>Batches appear here once alumni are added.</p></div>
            : (
                <div className="batch-grid">
                    {byBatch.map((b) => {
                        const members = alumni.filter((a) => a.batch === Number(b.batch));
                        return (
                            <div key={b.batch} className="batch-card" onClick={() => { setBatchFilter(b.batch); setPaidFilter("all"); setQuery(""); go("alumni"); }}>
                                <div className="batch-head">
                                    <div><span className="batch-eyebrow">Class of</span><div className="batch-year" style={{ color: batchColor(b.batch) }}>{b.batch}</div></div>
                                    <div className="batch-nums"><div><strong>{b.total}</strong><span>members</span></div><div><strong>{b.paid}</strong><span>registered</span></div></div>
                                </div>
                                <div className="cluster">
                                    {members.slice(0, 7).map((m) => <div key={m.id} className="cluster-av" title={m.name}><Avatar name={m.name} batch={m.batch} size={38} /></div>)}
                                    {members.length > 7 && <div className="cluster-more">+{members.length - 7}</div>}
                                </div>
                                <div className="batch-foot"><span><HeartHandshake size={14} /> {inr(b.don)} raised</span><span className="link">View batch →</span></div>
                            </div>
                        );
                    })}
                </div>
            )
    );

    const renderDonations = () => (
        <>
            <div className="toolbar">
                <div className="tb-summary">
                    <div><span className="muted">Total raised</span><strong>{inr(stats.totalDon)}</strong></div>
                    <div><span className="muted">Donors</span><strong>{stats.donors}</strong></div>
                    <div><span className="muted">Receipts</span><strong>{donations.length}</strong></div>
                </div>
                <button className="btn" onClick={() => setModal({ type: "recordDonation" })} disabled={alumni.length === 0}><Plus size={16} /> Record donation</button>
            </div>
            <div className="panel">
                <div className="table-wrap">
                    <table className="table">
                        <thead><tr><th>Receipt no.</th><th>Donor</th><th>Batch</th><th>Purpose</th><th className="right">Amount</th><th>Date</th><th></th></tr></thead>
                        <tbody>
                            {donations.map((d) => {
                                const a = alumniById(d.alumniId);
                                return (
                                    <tr key={d.id}>
                                        <td className="mono">{d.receiptNo}</td><td>{a?.name}</td><td>{a?.batch}</td><td>{d.purpose}</td>
                                        <td className="right mono">{inr(d.amount)}</td><td className="muted">{fmtDate(d.date)}</td>
                                        <td className="right"><button className="btn-ghost" onClick={() => setModal({ type: "receipt", data: d })}><Printer size={14} /> Receipt</button></td>
                                    </tr>
                                );
                            })}
                            {donations.length === 0 && <tr><td colSpan={7} className="empty">No donations recorded yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderCertificates = () => (
        <>
            <div className="toolbar">
                <span className="count">{certs.length} issued · certificates go to registered members only</span>
                <button className="btn" onClick={() => setModal({ type: "issueCert" })} disabled={alumni.length === 0}><Plus size={16} /> Issue certificate</button>
            </div>
            <div className="panel">
                <div className="table-wrap">
                    <table className="table">
                        <thead><tr><th>Certificate no.</th><th>Member</th><th>Batch</th><th>Issued on</th><th></th></tr></thead>
                        <tbody>
                            {certs.map((c) => {
                                const a = alumniById(c.alumniId);
                                return (
                                    <tr key={c.id}>
                                        <td className="mono">{c.certNo}</td><td>{a?.name}</td><td>{a?.batch}</td><td className="muted">{fmtDate(c.date)}</td>
                                        <td className="right"><button className="btn-ghost" onClick={() => setModal({ type: "certificate", data: c })}><Printer size={14} /> View</button></td>
                                    </tr>
                                );
                            })}
                            {certs.length === 0 && <tr><td colSpan={5} className="empty">No certificates issued yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderTimeline = () => (
        <div className="timeline">
            <div className="tl-intro">
                <Crest size={70} color="var(--navy)" />
                <div><h2>{TRUST.tagline} — a decade of giving back</h2><p className="muted">Milestones of the {TRUST.name} since {TRUST.estd}.</p></div>
            </div>
            <div className="tl-line">
                {timeline.map((t, i) => (
                    <div className="tl-item" key={i}><div className="tl-dot" /><div className="tl-year">{t.year}</div><div className="tl-body"><h4>{t.title}</h4><p>{t.text}</p></div></div>
                ))}
                {timeline.length === 0 && <p className="muted">No milestones yet.</p>}
            </div>
        </div>
    );

    /* ================= MODALS ================= */
    const closeModal = () => setModal(null);
    const renderModal = () => {
        if (!modal) return null;
        let inner = null;

        if (modal.type === "alumniDetail") {
            const a = alumniById(modal.data.id) || modal.data;
            const hasCert = certs.some((c) => c.alumniId === a.id);
            const donTotal = donations.filter((d) => d.alumniId === a.id).reduce((s, d) => s + d.amount, 0);
            inner = (
                <div className="detail">
                    <div className="detail-head">
                        <Avatar name={a.name} batch={a.batch} size={64} />
                        <div><h2>{a.name}</h2><span className="batch-chip" style={{ color: batchColor(a.batch) }}>Batch of {a.batch}</span></div>
                        <Tag paid={a.paid} />
                    </div>
                    <div className="detail-grid">
                        <Field icon={a.occ === "Business" ? Building2 : Briefcase} label={a.occ === "Business" ? "Business" : "Occupation"} value={`${a.role}${a.role && a.org ? ", " : ""}${a.org}`} />
                        <Field icon={MapPin} label="Located in" value={`${a.city}${a.city && a.country ? ", " : ""}${a.country}`} />
                        <Field icon={Heart} label="Marital status" value={a.marital || "\u2014"} />
                        <Field icon={Calendar} label="Member since" value={fmtDate(a.join)} />
                        <Field icon={Mail} label="Email" value={a.email || "\u2014"} />
                        <Field icon={Phone} label="Phone" value={a.phone || "\u2014"} />
                        <Field icon={HeartHandshake} label="Lifetime donations" value={inr(donTotal)} />
                        <Field icon={Award} label="Certificate" value={hasCert ? "Issued" : "Not issued"} />
                    </div>
                    {a.bio && <p className="bio">{a.bio}</p>}
                    <div className="detail-actions">
                        <button className="btn-ghost" onClick={() => togglePaid(a.id)}>{a.paid ? <><Circle size={15} /> Mark as unregistered</> : <><CheckCircle2 size={15} /> Mark as registered</>}</button>
                        {a.paid
                            ? (hasCert
                                ? <button className="btn" onClick={() => setModal({ type: "certificate", data: certs.find((c) => c.alumniId === a.id) })}><Award size={16} /> View certificate</button>
                                : <button className="btn" onClick={() => issueCert(a.id)}><Award size={16} /> Issue certificate</button>)
                            : <span className="hint">Mark the member as registered once their fee is received to enable the certificate.</span>}
                        <button className="btn" onClick={() => setModal({ type: "recordDonation", data: { alumniId: a.id } })}><HeartHandshake size={16} /> Record donation</button>
                    </div>
                </div>
            );
        }
        if (modal.type === "receipt") inner = <ReceiptDoc rec={modal.data} alumni={alumniById(modal.data.alumniId)} />;
        if (modal.type === "certificate") inner = <CertificateDoc rec={modal.data} alumni={alumniById(modal.data.alumniId)} />;
        if (modal.type === "recordDonation") inner = <DonationForm alumni={alumni} preset={modal.data} onSubmit={recordDonation} />;
        if (modal.type === "issueCert") inner = <IssueCertForm alumni={alumni.filter((a) => a.paid && !certs.some((c) => c.alumniId === a.id))} onSubmit={issueCert} />;
        if (modal.type === "addAlumni") inner = <AddAlumniForm batches={batches} onSubmit={addAlumnus} />;

        return (
            <div className="overlay" onClick={closeModal}>
                <div className={`modal ${modal.type === "certificate" ? "modal-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close" onClick={closeModal}><X size={18} /></button>
                    {inner}
                </div>
            </div>
        );
    };

    return (
        <div className="app">
            <style>{CSS}</style>

            {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

            <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
                <div className="brand">
                    <Crest size={40} chip />
                    <div className="brand-txt"><strong>MNPS</strong><span>Alumni Trust</span><em>{TRUST.tagline}</em></div>
                </div>
                <nav>
                    {NAV.map((n) => (
                        <button key={n.id} className={view === n.id ? "nav active" : "nav"} onClick={() => go(n.id)}><n.icon size={18} /> {n.label}</button>
                    ))}
                </nav>
                <div className="side-foot"><span className="sf-top"><Landmark size={14} /> Admin Portal</span><span>{TRUST.school}</span><span>Jamshedpur · Est. {TRUST.estd}</span></div>
            </aside>

            <main className="main">
                <header className="topbar">
                    <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu"><Menu size={20} /></button>
                    <h1>{titles[view]}</h1>
                    {batchFilter !== "all" && view === "alumni" && (
                        <button className="filter-pill" onClick={() => setBatchFilter("all")}>Batch of {batchFilter} <X size={13} /></button>
                    )}
                    <button className="refresh" onClick={loadAll} title="Refresh"><RefreshCw size={16} /></button>
                </header>
                <div className="content">
                    {loading
                        ? <div className="loader"><div className="spinner" /><span>Loading from the trust database…</span></div>
                        : error
                            ? <div className="errorcard">
                                <h3>Couldn't reach the API</h3>
                                <p className="muted">{error}</p>
                                <p className="muted" style={{ marginTop: 8 }}>Check that the Function App is running, that <code>API_BASE</code> is correct, and that CORS on the Function App allows this site.</p>
                                <button className="btn" style={{ marginTop: 12 }} onClick={loadAll}><RefreshCw size={15} /> Try again</button>
                            </div>
                            : <>
                                {view === "dashboard" && renderDashboard()}
                                {view === "alumni" && renderAlumni()}
                                {view === "batches" && renderBatches()}
                                {view === "donations" && renderDonations()}
                                {view === "certificates" && renderCertificates()}
                                {view === "timeline" && renderTimeline()}
                            </>}
                </div>
            </main>

            {renderModal()}
            {banner && <div className={`banner ${banner.isError ? "error" : ""}`}>{banner.text}</div>}
        </div>
    );
}

/* ---------- small components ---------- */
function StatCard({ label, value, sub, icon: Icon, accent }) {
    return (
        <div className={accent ? "stat accent" : "stat"}>
            <div className="stat-ic"><Icon size={18} /></div>
            <div className="stat-val">{value}</div>
            <div className="stat-lbl">{label}</div>
            <div className="stat-sub">{sub}</div>
        </div>
    );
}
function Field({ icon: Icon, label, value }) {
    return <div className="field"><Icon size={15} /><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function ReceiptDoc({ rec, alumni }) {
    return (
        <div className="doc receipt">
            <div className="doc-head">
                <Crest size={62} color="var(--navy)" />
                <div className="doc-title"><h2>{TRUST.name}</h2><span>{TRUST.school} · {TRUST.address}</span><span className="doc-type">Donation Receipt</span></div>
            </div>
            <div className="rcpt-meta"><div><span>Receipt no.</span><strong className="mono">{rec.receiptNo}</strong></div><div><span>Date</span><strong>{fmtDate(rec.date)}</strong></div></div>
            <p className="rcpt-line">Received with gratitude from <strong>{alumni?.name}</strong> (Batch of {alumni?.batch}) the sum of <strong>{inr(rec.amount)}</strong> towards <strong>{rec.purpose}</strong>.</p>
            <p className="rcpt-words">Rupees {amountToWords(rec.amount)}</p>
            <div className="rcpt-amount"><span>Amount received</span><strong className="mono">{inr(rec.amount)}</strong></div>
            <p className="rcpt-80g">
                {TRUST.reg80G
                    ? `Donations to ${TRUST.name} are eligible for tax exemption under Section 80G of the Income Tax Act (80G Reg. no. ${TRUST.reg80G}). `
                    : `${TRUST.name} does not hold 80G registration; this donation is not eligible for income-tax exemption under Section 80G. `}
                Regd. under the Indian Trusts Act, 1882 · Reg. no. {TRUST.regNo} · PAN {TRUST.pan}. This is a computer-generated receipt.
            </p>
            <div className="doc-sign"><div className="sign-line" /><span>Authorised Signatory · {TRUST.treasurer}</span></div>
            <p className="doc-contact">{TRUST.phones} · {TRUST.email} · {TRUST.website}</p>
            <button className="btn print" onClick={() => window.print()}><Printer size={16} /> Print / Save as PDF</button>
        </div>
    );
}

function CertificateDoc({ rec, alumni }) {
    return (
        <div className="doc cert">
            <div className="cert-border">
                <div className="cert-inner">
                    <Crest size={92} color="var(--navy)" />
                    <h2 className="cert-org">{TRUST.name}</h2>
                    <span className="cert-sub">{TRUST.school} · Jamshedpur · Est. {TRUST.estd}</span>
                    <div className="cert-rule" />
                    <p className="cert-kicker">Certificate of Membership</p>
                    <p className="cert-text">This is to certify that</p>
                    <h1 className="cert-name">{alumni?.name}</h1>
                    <p className="cert-text">of the graduating <strong>Batch of {alumni?.batch}</strong> is a duly registered member of the {TRUST.name}, and is hereby welcomed into the alumni fraternity with all rights and privileges thereof.</p>
                    <p className="cert-motto">{TRUST.tagline} — {TRUST.legacy}</p>
                    <div className="cert-foot">
                        <div><span className="mono">{rec.certNo}</span><small>Membership no.</small></div>
                        <div className="doc-sign center"><div className="sign-line" /><span>{TRUST.president} · {TRUST.name}</span></div>
                        <div><span>{fmtDate(rec.date)}</span><small>Date of issue</small></div>
                    </div>
                    <div className="cert-stamp"><Seal size={66} id="cert-seal" /></div>
                </div>
            </div>
            <button className="btn print" onClick={() => window.print()}><Printer size={16} /> Print / Save as PDF</button>
        </div>
    );
}

function DonationForm({ alumni, preset, onSubmit }) {
    const [f, setF] = useState({ alumniId: preset?.alumniId || alumni[0]?.id, amount: "", purpose: "Scholarship Fund", date: new Date().toISOString().slice(0, 10) });
    const [busy, setBusy] = useState(false);
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const ok = f.alumniId && Number(f.amount) > 0 && !busy;
    return (
        <div className="form">
            <h2>Record donation</h2>
            <p className="muted">A receipt is generated and emailed automatically.</p>
            <label>Donor<select value={f.alumniId} onChange={set("alumniId")}>{alumni.map((a) => <option key={a.id} value={a.id}>{a.name} — Batch of {a.batch}</option>)}</select></label>
            <label>Amount (₹)<input type="number" min="1" placeholder="e.g. 25000" value={f.amount} onChange={set("amount")} /></label>
            <label>Purpose<select value={f.purpose} onChange={set("purpose")}>{["Scholarship Fund", "General Fund", "Library Renovation", "Sports Equipment", "Medical Camp", "Computer Lab", "New Auditorium"].map((p) => <option key={p}>{p}</option>)}</select></label>
            <label>Date<input type="date" value={f.date} onChange={set("date")} /></label>
            <button className="btn" disabled={!ok} onClick={async () => { setBusy(true); await onSubmit(f); setBusy(false); }}><HeartHandshake size={16} /> {busy ? "Working…" : "Record & issue receipt"}</button>
        </div>
    );
}

function IssueCertForm({ alumni, onSubmit }) {
    const [id, setId] = useState(alumni[0]?.id || "");
    const [busy, setBusy] = useState(false);
    return (
        <div className="form">
            <h2>Issue membership certificate</h2>
            {alumni.length === 0
                ? <p className="muted">Every registered member already has a certificate, or no members are registered yet. Certificates are issued only to registered members.</p>
                : (<>
                    <p className="muted">Only registered members without an existing certificate are listed.</p>
                    <label>Member<select value={id} onChange={(e) => setId(e.target.value)}>{alumni.map((a) => <option key={a.id} value={a.id}>{a.name} — Batch of {a.batch}</option>)}</select></label>
                    <button className="btn" disabled={!id || busy} onClick={async () => { setBusy(true); await onSubmit(id); setBusy(false); }}><Award size={16} /> {busy ? "Working…" : "Issue certificate"}</button>
                </>)}
        </div>
    );
}

function AddAlumniForm({ batches, onSubmit }) {
    const thisYear = new Date().getFullYear();
    const [f, setF] = useState({ name: "", batch: batches[0] || thisYear, occ: "Job", org: "", role: "", city: "", country: "India", marital: "Single", paid: "false", email: "", phone: "", bio: "" });
    const [busy, setBusy] = useState(false);
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const ok = f.name && f.city && !busy;
    return (
        <div className="form form-wide">
            <h2>Add alumnus</h2>
            <div className="form-row">
                <label>Full name<input value={f.name} onChange={set("name")} placeholder="e.g. Ananya Rao" /></label>
                <label>Batch (grad. year)<input type="number" min="1950" max={thisYear} value={f.batch} onChange={set("batch")} /></label>
            </div>
            <div className="form-row">
                <label>Type<select value={f.occ} onChange={set("occ")}><option>Job</option><option>Business</option></select></label>
                <label>Registration<select value={f.paid} onChange={set("paid")}><option value="false">Unregistered</option><option value="true">Registered (paid)</option></select></label>
            </div>
            <div className="form-row">
                <label>Organisation / business<input value={f.org} onChange={set("org")} placeholder="e.g. Infosys" /></label>
                <label>Role<input value={f.role} onChange={set("role")} placeholder="e.g. Engineer" /></label>
            </div>
            <div className="form-row">
                <label>City<input value={f.city} onChange={set("city")} /></label>
                <label>Country<input value={f.country} onChange={set("country")} /></label>
                <label>Marital status<select value={f.marital} onChange={set("marital")}><option>Single</option><option>Married</option></select></label>
            </div>
            <div className="form-row">
                <label>Email<input value={f.email} onChange={set("email")} /></label>
                <label>Phone<input value={f.phone} onChange={set("phone")} /></label>
            </div>
            <label>Short bio<textarea rows={2} value={f.bio} onChange={set("bio")} /></label>
            <button className="btn" disabled={!ok} onClick={async () => { setBusy(true); await onSubmit(f); setBusy(false); }}><Plus size={16} /> {busy ? "Adding…" : "Add to directory"}</button>
        </div>
    );
}

/* ================= STYLES ================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root{
  --ink:#2b4257; --ink-soft:#38536b; --navy:#38536b; --paper:#f2f4f6; --brass:#b9764c; --brass-2:#9c5f39;
  --stone:#eceef1; --card:#ffffff; --line:#e3e6ea; --text:#2a3745; --muted:#6b7885;
  --paid:#2f7d6b; --paid-bg:#e3f0ec; --unpaid:#9c5f39; --unpaid-bg:#f3e8dd;
}
*{box-sizing:border-box}
.app{display:flex; min-height:100vh; background:var(--stone); color:var(--text); font-family:'Inter',system-ui,sans-serif; font-size:14px; line-height:1.5;}
.mono{font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums;}
h1,h2,h3,h4{font-family:'Fraunces',Georgia,serif; margin:0; color:var(--ink); font-weight:600; letter-spacing:-.01em;}
.muted{color:var(--muted)} code{font-family:'IBM Plex Mono',monospace; font-size:.9em; background:var(--stone); padding:1px 5px; border-radius:4px}
button{font-family:inherit; cursor:pointer;}

.sidebar{width:236px; background:var(--ink); color:#cfd8e6; display:flex; flex-direction:column; padding:20px 14px; position:sticky; top:0; height:100vh; flex-shrink:0;}
.brand{display:flex; align-items:center; gap:11px; padding:4px 8px 22px;}
.brand-txt{display:flex; flex-direction:column; line-height:1.1}
.brand-txt strong{font-family:'Fraunces',serif; color:#fff; font-size:19px; letter-spacing:.02em}
.brand-txt span{font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--brass)}
.brand-txt em{font-style:italic; font-family:'Fraunces',serif; font-size:11px; color:#9fb0c9; margin-top:2px}
.crest{display:block}
.crest.chip{background:#fff; border-radius:11px; padding:5px; box-shadow:0 1px 4px rgba(0,0,0,.18)}
nav{display:flex; flex-direction:column; gap:3px; flex:1}
.nav{display:flex; align-items:center; gap:11px; padding:10px 12px; border:none; background:none; color:#aeb9cc; border-radius:9px; text-align:left; font-size:13.5px; font-weight:500; transition:.15s}
.nav:hover{background:rgba(255,255,255,.06); color:#fff}
.nav.active{background:var(--brass); color:#1a1200; font-weight:600}
.side-foot{font-size:11px; color:#8494ab; padding:14px 10px 4px; border-top:1px solid rgba(255,255,255,.08); display:flex; flex-direction:column; gap:3px; align-items:flex-start}
.side-foot .sf-top{display:flex; gap:6px; align-items:center; color:var(--brass); text-transform:uppercase; letter-spacing:.12em; font-size:10px}

.main{flex:1; min-width:0; display:flex; flex-direction:column}
.topbar{display:flex; align-items:center; gap:14px; padding:22px 32px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.55); position:sticky; top:0; z-index:5; backdrop-filter:blur(6px)}
.topbar h1{font-size:24px; flex:1}
.hamburger{display:none; background:none; border:1px solid var(--line); border-radius:8px; width:38px; height:38px; align-items:center; justify-content:center; color:var(--ink)}
.refresh{background:none; border:1px solid var(--line); border-radius:8px; width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; color:var(--muted)}
.refresh:hover{color:var(--brass-2); border-color:var(--brass)}
.filter-pill{display:flex; align-items:center; gap:6px; background:var(--ink); color:#fff; border:none; padding:5px 11px; border-radius:20px; font-size:12px}
.content{padding:26px 32px 60px; max-width:1180px; width:100%}
.scrim{display:none}

.stat-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:16px; margin-bottom:22px}
.stat{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px}
.stat.accent{background:var(--ink); border-color:var(--ink)}
.stat.accent .stat-val,.stat.accent .stat-lbl{color:#fff}
.stat.accent .stat-sub{color:#9fb0c9}
.stat.accent .stat-ic{background:var(--brass); color:#1a1200}
.stat-ic{width:34px; height:34px; border-radius:9px; background:var(--stone); color:var(--ink); display:flex; align-items:center; justify-content:center; margin-bottom:12px}
.stat-val{font-family:'Fraunces',serif; font-size:27px; font-weight:600; color:var(--ink); line-height:1}
.stat-lbl{font-weight:600; margin-top:6px; font-size:13px}
.stat-sub{color:var(--muted); font-size:12px; margin-top:2px}

.two-col{display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px}
.panel{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 20px; margin-bottom:16px}
.panel-head{display:flex; align-items:baseline; justify-content:space-between; margin-bottom:14px; gap:10px}
.panel-head h3{font-size:16px}
.panel-head .muted{font-size:12px}

.table-wrap{overflow-x:auto; -webkit-overflow-scrolling:touch}
.table{width:100%; border-collapse:collapse; font-size:13px; min-width:540px}
.table th{text-align:left; color:var(--muted); font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.06em; padding:8px 10px; border-bottom:1px solid var(--line)}
.table td{padding:11px 10px; border-bottom:1px solid #f1eee4}
.table tr:last-child td{border-bottom:none}
.right{text-align:right}
.empty{text-align:center; color:var(--muted); padding:22px}

.btn{display:inline-flex; align-items:center; gap:7px; background:var(--ink); color:#fff; border:none; padding:9px 15px; border-radius:9px; font-weight:600; font-size:13px; transition:.15s}
.btn:hover{background:var(--ink-soft)}
.btn:disabled{opacity:.4; cursor:not-allowed}
.btn-ghost{display:inline-flex; align-items:center; gap:6px; background:none; border:1px solid var(--line); color:var(--ink); padding:6px 11px; border-radius:8px; font-size:12.5px; font-weight:500}
.btn-ghost:hover{border-color:var(--brass); color:var(--brass-2)}

.toolbar{display:flex; align-items:center; gap:12px; margin-bottom:18px; flex-wrap:wrap}
.search{display:flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--line); border-radius:9px; padding:0 12px; flex:1; min-width:200px; color:var(--muted)}
.search input{border:none; outline:none; padding:10px 0; font-size:13.5px; width:100%; background:none; color:var(--text); font-family:inherit}
.toolbar select{background:var(--card); border:1px solid var(--line); border-radius:9px; padding:9px 12px; font-size:13px; color:var(--text); font-family:inherit}
.count{font-size:12.5px; color:var(--muted)}
.tb-summary{display:flex; gap:26px; flex:1; flex-wrap:wrap}
.tb-summary div{display:flex; flex-direction:column}
.tb-summary strong{font-family:'Fraunces',serif; font-size:20px; color:var(--ink)}
.tb-summary span{font-size:12px}

.card-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px}
.alumni-card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; cursor:pointer; transition:.15s}
.alumni-card:hover{border-color:var(--brass); box-shadow:0 6px 22px rgba(21,38,65,.07); transform:translateY(-2px)}
.ac-top{display:flex; align-items:center; gap:12px; margin-bottom:13px}
.ac-id{flex:1; min-width:0}
.ac-id h4{font-size:15.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.batch-chip{font-size:11px; font-weight:600; letter-spacing:.03em}
.ac-meta{display:flex; flex-direction:column; gap:6px; font-size:12.5px}
.ac-meta span{display:flex; align-items:center; gap:7px; color:#41505f}
.ac-meta svg{color:var(--muted); flex-shrink:0}
.avatar{border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; flex-shrink:0}

.tag{font-size:10.5px; font-weight:600; padding:4px 9px; border-radius:20px; letter-spacing:.03em; white-space:nowrap}
.tag-paid{background:var(--paid-bg); color:var(--paid)}
.tag-unpaid{background:var(--unpaid-bg); color:var(--unpaid)}

.batch-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px}
.batch-card{background:var(--card); border:1px solid var(--line); border-radius:16px; padding:20px; cursor:pointer; transition:.15s}
.batch-card:hover{border-color:var(--brass); box-shadow:0 8px 26px rgba(21,38,65,.08); transform:translateY(-2px)}
.batch-head{display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px}
.batch-eyebrow{font-size:11px; text-transform:uppercase; letter-spacing:.14em; color:var(--muted)}
.batch-year{font-family:'Fraunces',serif; font-size:38px; font-weight:600; line-height:1}
.batch-nums{display:flex; gap:18px; text-align:right}
.batch-nums strong{font-family:'Fraunces',serif; font-size:20px; color:var(--ink); display:block}
.batch-nums span{font-size:11px; color:var(--muted)}
.cluster{display:flex; align-items:center; margin-bottom:16px}
.cluster-av{margin-right:-10px; border:2px solid var(--card); border-radius:50%}
.cluster-more{margin-left:2px; font-size:12px; font-weight:600; color:var(--muted); background:var(--stone); width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid var(--card)}
.batch-foot{display:flex; justify-content:space-between; align-items:center; font-size:12.5px; padding-top:14px; border-top:1px solid var(--line)}
.batch-foot span:first-child{display:flex; align-items:center; gap:6px; color:#41505f}
.batch-foot svg{color:var(--brass-2)}
.link{color:var(--brass-2); font-weight:600}

.timeline{max-width:760px}
.tl-intro{display:flex; align-items:center; gap:18px; margin-bottom:30px}
.tl-intro h2{font-size:24px}
.tl-line{position:relative; padding-left:26px}
.tl-line:before{content:""; position:absolute; left:6px; top:6px; bottom:6px; width:2px; background:linear-gradient(var(--brass),var(--line))}
.tl-item{position:relative; padding:0 0 26px 22px}
.tl-dot{position:absolute; left:-26px; top:4px; width:14px; height:14px; border-radius:50%; background:var(--brass); border:3px solid var(--stone); box-shadow:0 0 0 2px var(--brass)}
.tl-year{font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:600; color:var(--brass-2); letter-spacing:.04em}
.tl-body h4{font-size:17px; margin:2px 0 5px}
.tl-body p{color:#41505f; font-size:13.5px; margin:0}

.loader{display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 20px; color:var(--muted); gap:14px}
.spinner{width:34px; height:34px; border:3px solid var(--line); border-top-color:var(--brass); border-radius:50%; animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.errorcard{background:#fff; border:1px solid var(--line); border-left:4px solid #b4462f; border-radius:12px; padding:20px; max-width:580px; margin:20px auto}
.errorcard h3{color:#b4462f; margin-bottom:6px}
.empty-state{display:flex; flex-direction:column; align-items:center; gap:12px; padding:60px 20px; color:var(--muted); text-align:center}
.empty-state svg{color:var(--brass)}
.empty-state p{max-width:420px}
.banner{position:fixed; left:50%; bottom:24px; transform:translateX(-50%); background:var(--ink); color:#fff; padding:11px 18px; border-radius:10px; font-size:13px; z-index:80; box-shadow:0 8px 24px rgba(0,0,0,.25); max-width:90vw; text-align:center}
.banner.error{background:#8f2f1e}

.overlay{position:fixed; inset:0; background:rgba(15,26,45,.5); backdrop-filter:blur(3px); display:flex; align-items:flex-start; justify-content:center; padding:40px 20px; overflow-y:auto; z-index:50}
.modal{background:var(--card); border-radius:16px; width:100%; max-width:520px; padding:26px; position:relative; box-shadow:0 24px 60px rgba(0,0,0,.28)}
.modal-wide{max-width:720px}
.modal-close{position:absolute; top:14px; right:14px; background:var(--stone); border:none; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--ink); z-index:2}
.modal-close:hover{background:var(--line)}

.detail-head{display:flex; align-items:center; gap:14px; margin-bottom:20px}
.detail-head h2{font-size:22px}
.detail-head > :last-child{margin-left:auto}
.detail-grid{display:grid; grid-template-columns:1fr 1fr; gap:14px 22px; margin-bottom:16px}
.field{display:flex; gap:10px; align-items:flex-start}
.field svg{color:var(--brass-2); margin-top:2px; flex-shrink:0}
.field span{display:block; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em}
.field strong{font-weight:600; font-size:13.5px; word-break:break-word}
.bio{background:var(--stone); border-radius:10px; padding:12px 14px; font-size:13px; color:#41505f; margin:0 0 18px}
.detail-actions{display:flex; gap:10px; flex-wrap:wrap; border-top:1px solid var(--line); padding-top:18px}
.hint{font-size:12.5px; color:var(--unpaid); background:var(--unpaid-bg); padding:10px 12px; border-radius:9px; flex:1}

.form{display:flex; flex-direction:column; gap:14px}
.form h2{font-size:21px}
.form > .muted{margin-top:-8px; font-size:12.5px}
.form label{display:flex; flex-direction:column; gap:5px; font-size:12px; font-weight:600; color:var(--ink)}
.form input,.form select,.form textarea{border:1px solid var(--line); border-radius:9px; padding:10px 12px; font-size:16px; font-family:inherit; color:var(--text); background:#fff; font-weight:400}
.form input:focus,.form select:focus,.form textarea:focus{outline:none; border-color:var(--brass)}
.form .btn{margin-top:4px; justify-content:center}
.form-row{display:flex; gap:12px}
.form-row label{flex:1}
.form-wide{max-width:100%}

.doc{display:flex; flex-direction:column}
.doc-head{display:flex; align-items:center; gap:16px; padding-bottom:16px; border-bottom:2px solid var(--brass)}
.doc-title h2{font-size:22px}
.doc-title span{display:block; font-size:11px; color:var(--muted); letter-spacing:.06em}
.doc-type{margin-top:6px; font-family:'IBM Plex Mono',monospace; color:var(--brass-2)!important; text-transform:uppercase; letter-spacing:.1em; font-size:11px!important}
.receipt .rcpt-meta{display:flex; justify-content:space-between; margin:18px 0; gap:14px}
.rcpt-meta div{display:flex; flex-direction:column}
.rcpt-meta span{font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em}
.rcpt-meta strong{font-size:14px; margin-top:2px}
.rcpt-line{font-size:14.5px; line-height:1.7; margin:0 0 6px}
.rcpt-words{font-style:italic; color:var(--brass-2); font-family:'Fraunces',serif; font-size:14px; margin:0 0 16px}
.rcpt-amount{display:flex; justify-content:space-between; align-items:center; background:var(--stone); border-radius:10px; padding:14px 16px; margin-bottom:14px}
.rcpt-amount span{font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted)}
.rcpt-amount strong{font-size:22px; color:var(--ink); font-weight:600}
.rcpt-80g{font-size:11px; color:var(--muted); line-height:1.5; margin:0 0 20px}
.doc-contact{font-size:10.5px; color:var(--muted); text-align:center; border-top:1px solid var(--line); padding-top:10px; margin:0 0 18px}
.doc-sign{display:flex; flex-direction:column; align-items:flex-end; margin-bottom:16px}
.doc-sign.center{align-items:center; margin:0}
.sign-line{width:150px; border-top:1px solid var(--ink); margin-bottom:5px}
.doc-sign span{font-size:11px; color:var(--muted)}
.print{align-self:flex-start; justify-content:center}

.cert-border{border:2px solid var(--brass); border-radius:6px; padding:6px}
.cert-inner{position:relative; border:1px solid var(--brass); border-radius:4px; padding:34px 40px; text-align:center; display:flex; flex-direction:column; align-items:center; background:linear-gradient(180deg,#fffdf8,#fbf7ec)}
.cert-org{font-size:26px; margin-top:12px}
.cert-sub{font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--brass-2); margin-top:3px}
.cert-rule{width:60px; height:2px; background:var(--brass); margin:16px 0}
.cert-kicker{font-family:'IBM Plex Mono',monospace; text-transform:uppercase; letter-spacing:.22em; font-size:12px; color:var(--brass-2); margin:0}
.cert-text{font-size:14px; color:#41505f; margin:10px 0; max-width:440px; line-height:1.7}
.cert-name{font-family:'Fraunces',serif; font-size:34px; color:var(--ink); font-weight:600; margin:6px 0}
.cert-motto{font-family:'Fraunces',serif; font-style:italic; font-size:13px; color:var(--brass-2); margin:14px 0 0}
.cert-foot{position:relative; z-index:1; display:flex; justify-content:space-between; align-items:flex-end; width:100%; margin-top:30px; gap:10px}
.cert-foot > div{display:flex; flex-direction:column; align-items:center; gap:2px}
.cert-foot span{font-size:13px; font-weight:600; color:var(--ink)}
.cert-foot small{font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em}
.cert-stamp{position:absolute; left:50%; bottom:56px; transform:translateX(-50%); opacity:.1; pointer-events:none; z-index:0}
.doc .print{margin-top:20px}

@media (max-width:900px){ .two-col{grid-template-columns:1fr} }
@media (max-width:820px){
  .app{display:block}
  .sidebar{position:fixed; top:0; left:0; height:100vh; width:238px; transform:translateX(-100%); transition:transform .25s ease; z-index:60}
  .sidebar.open{transform:none; box-shadow:0 0 50px rgba(0,0,0,.45)}
  .scrim{display:block; position:fixed; inset:0; background:rgba(10,18,30,.5); z-index:55}
  .main{width:100%}
  .hamburger{display:inline-flex}
  .topbar{padding:14px 16px; gap:10px}
  .topbar h1{font-size:20px}
  .content{padding:18px 16px 50px}
}
@media (max-width:560px){
  .content{padding:14px}
  .detail-grid{grid-template-columns:1fr}
  .form-row{flex-direction:column}
  .toolbar .search{min-width:0; flex:1 1 100%}
  .toolbar select{flex:1 1 100%}
  .toolbar .btn{flex:1 1 100%; justify-content:center}
  .overlay{padding:14px}
  .modal{padding:20px}
  .cert-inner{padding:20px 16px}
  .cert-org{font-size:20px}
  .cert-name{font-size:23px}
  .cert-text{font-size:12.5px}
  .cert-foot{flex-direction:column; align-items:center; gap:16px}
  .doc-head{gap:10px}
  .doc-title h2{font-size:18px}
  .detail-head{flex-wrap:wrap}
  .detail-head > :last-child{margin-left:0}
}
`;
