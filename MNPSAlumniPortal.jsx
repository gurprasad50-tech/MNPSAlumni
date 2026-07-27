import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  LayoutDashboard, Users, GraduationCap, HeartHandshake, Award, History,
  Search, Plus, MapPin, Briefcase, Building2, Heart, X, Printer,
  CheckCircle2, Circle, Landmark, Mail, Phone, Calendar, Quote, IndianRupee,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MNPS Alumni Trust — Admin Portal (prototype, in-memory data)       */
/* ------------------------------------------------------------------ */

/* Real trust identity — supplied by the trust. The four "—" fields still
   need the official registration/tax details before documents go live. */
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
  estd: 2015,
  darpan: "JH/2025/0649469",
  regNo: "2025/JSR/1730/BK4/137",   // Trust registration no. (Indian Trusts Act, 1882)
  pan: "AAKTM0976H",
  reg80G: "",                        // leave empty until 80G is actually granted
  president: "Shazia Raza Khan",
  treasurer: "Gurprasad Singh Sokhi",
};

const BATCH_COLORS = {
  1998: "#3b5a7a", 2003: "#6a5a8a", 2007: "#3f7a6a",
  2011: "#8a5a4a", 2016: "#5a7a44", 2020: "#7a6a34",
};

const SEED_ALUMNI = [
  { id: 1, name: "Rajesh Menon", batch: 1998, occ: "Job", org: "Infosys", role: "VP, Engineering", city: "Bengaluru", country: "India", marital: "Married", paid: true, join: "2018-06-12", email: "rajesh.menon@example.com", phone: "+91 98450 11223", bio: "Leads a 400-person platform org. Mentors young alumni entering tech." },
  { id: 2, name: "Anita Desai", batch: 1998, occ: "Business", org: "Desai Textiles", role: "Founder", city: "Surat", country: "India", marital: "Married", paid: true, join: "2019-01-20", email: "anita@desaitextiles.example", phone: "+91 90999 22110", bio: "Runs a third-generation textile house employing 200+ artisans." },
  { id: 3, name: "Vikram Nair", batch: 1998, occ: "Job", org: "Boeing", role: "Senior Engineer", city: "Seattle", country: "USA", marital: "Married", paid: false, join: "2021-09-03", email: "vikram.nair@example.com", phone: "+1 206 555 0182", bio: "Aerospace structures engineer. Visits campus every alternate reunion." },
  { id: 4, name: "Priya Sharma", batch: 2003, occ: "Job", org: "AIIMS", role: "Cardiologist", city: "New Delhi", country: "India", marital: "Married", paid: true, join: "2018-11-02", email: "dr.priya@example.com", phone: "+91 99100 44556", bio: "Runs the trust's annual free cardiac screening camp." },
  { id: 5, name: "Karan Malhotra", batch: 2003, occ: "Business", org: "Malhotra Exports", role: "Managing Director", city: "Mumbai", country: "India", marital: "Single", paid: true, join: "2019-03-15", email: "karan@malhotraexports.example", phone: "+91 98200 33445", bio: "One of the trust's earliest major donors." },
  { id: 6, name: "Sneha Iyer", batch: 2003, occ: "Job", org: "Deloitte", role: "Manager", city: "Pune", country: "India", marital: "Single", paid: false, join: "2022-02-11", email: "sneha.iyer@example.com", phone: "+91 90040 55667", bio: "Advises the trust on audit and compliance pro bono." },
  { id: 7, name: "Arjun Reddy", batch: 2007, occ: "Business", org: "Reddy Farms", role: "Owner", city: "Hyderabad", country: "India", marital: "Married", paid: true, join: "2020-07-19", email: "arjun@reddyfarms.example", phone: "+91 91000 66778", bio: "Sponsors the sports programme every year." },
  { id: 8, name: "Meera Krishnan", batch: 2007, occ: "Job", org: "Google", role: "Product Manager", city: "London", country: "UK", marital: "Married", paid: true, join: "2019-08-30", email: "meera.k@example.com", phone: "+44 7700 900123", bio: "Coordinates the overseas chapter of the alumni network." },
  { id: 9, name: "Rohit Verma", batch: 2007, occ: "Job", org: "Indian Army", role: "Major", city: "Jaipur", country: "India", marital: "Married", paid: false, join: "2021-12-01", email: "rohit.verma@example.com", phone: "+91 94140 77889", bio: "Speaks at the annual leadership session for students." },
  { id: 10, name: "Aditya Kapoor", batch: 2011, occ: "Business", org: "Kapoor Cafe", role: "Co-founder", city: "Mumbai", country: "India", marital: "Single", paid: true, join: "2020-05-22", email: "aditya@kapoorcafe.example", phone: "+91 98670 88990", bio: "Hosts alumni meetups at his cafe chain." },
  { id: 11, name: "Divya Rao", batch: 2011, occ: "Job", org: "Microsoft", role: "Software Engineer", city: "Hyderabad", country: "India", marital: "Single", paid: true, join: "2021-04-10", email: "divya.rao@example.com", phone: "+91 90300 99001", bio: "Built the first version of the trust's member portal." },
  { id: 12, name: "Sameer Khan", batch: 2011, occ: "Job", org: "Al-Futtaim", role: "Analyst", city: "Dubai", country: "UAE", marital: "Married", paid: false, join: "2022-06-18", email: "sameer.khan@example.com", phone: "+971 50 123 4567", bio: "Runs the Gulf alumni WhatsApp community." },
  { id: 13, name: "Nisha Gupta", batch: 2011, occ: "Job", org: "Delhi Public School", role: "Teacher", city: "Kanpur", country: "India", marital: "Married", paid: true, join: "2020-09-14", email: "nisha.gupta@example.com", phone: "+91 99360 12312", bio: "Volunteers as an academic mentor for scholarship students." },
  { id: 14, name: "Tanvi Joshi", batch: 2016, occ: "Business", org: "Studio Tanvi", role: "Design Lead", city: "Bengaluru", country: "India", marital: "Single", paid: true, join: "2021-11-05", email: "tanvi@studiotanvi.example", phone: "+91 91480 23423", bio: "Designed the trust's new brand identity, pro bono." },
  { id: 15, name: "Harsh Agarwal", batch: 2016, occ: "Business", org: "Agarwal Digital", role: "Founder", city: "Indore", country: "India", marital: "Single", paid: true, join: "2022-01-30", email: "harsh@agarwaldigital.example", phone: "+91 90390 34534", bio: "Funds the campus computer lab upgrades." },
  { id: 16, name: "Pooja Nagpal", batch: 2016, occ: "Job", org: "TCS", role: "Consultant", city: "Chennai", country: "India", marital: "Single", paid: false, join: "2023-03-22", email: "pooja.nagpal@example.com", phone: "+91 90420 45645", bio: "New member, keen to volunteer for events." },
  { id: 17, name: "Aryan Singh", batch: 2020, occ: "Job", org: "Zomato", role: "Data Scientist", city: "Gurugram", country: "India", marital: "Single", paid: true, join: "2023-07-08", email: "aryan.singh@example.com", phone: "+91 98110 56756", bio: "Youngest member of the donations committee." },
  { id: 18, name: "Ishita Bose", batch: 2020, occ: "Job", org: "Pratham (NGO)", role: "Programme Lead", city: "Kolkata", country: "India", marital: "Single", paid: false, join: "2024-01-15", email: "ishita.bose@example.com", phone: "+91 98300 67867", bio: "Connects the trust with education-sector partners." },
  { id: 19, name: "Dev Patel", batch: 2020, occ: "Business", org: "Patel Organics", role: "Partner", city: "Ahmedabad", country: "India", marital: "Single", paid: true, join: "2023-10-27", email: "dev@patelorganics.example", phone: "+91 90990 78978", bio: "Supplies produce for reunion events at cost." },
  { id: 20, name: "Kavya Menon", batch: 2020, occ: "Job", org: "Amazon", role: "SDE", city: "Bengaluru", country: "India", marital: "Single", paid: true, join: "2024-02-19", email: "kavya.menon@example.com", phone: "+91 98451 89089", bio: "Maintains the alumni member directory." },
];

const SEED_DONATIONS = [
  { id: 1, alumniId: 5, amount: 500000, date: "2024-08-05", purpose: "New Auditorium", receiptNo: "MNPS/R/2024-25/0001" },
  { id: 2, alumniId: 2, amount: 250000, date: "2024-11-20", purpose: "Library Renovation", receiptNo: "MNPS/R/2024-25/0002" },
  { id: 3, alumniId: 8, amount: 120000, date: "2025-01-28", purpose: "Scholarship Fund", receiptNo: "MNPS/R/2024-25/0003" },
  { id: 4, alumniId: 1, amount: 100000, date: "2025-01-15", purpose: "Scholarship Fund", receiptNo: "MNPS/R/2024-25/0004" },
  { id: 5, alumniId: 7, amount: 75000, date: "2025-03-01", purpose: "Sports Equipment", receiptNo: "MNPS/R/2024-25/0005" },
  { id: 6, alumniId: 4, amount: 50000, date: "2025-02-10", purpose: "Medical Camp", receiptNo: "MNPS/R/2024-25/0006" },
  { id: 7, alumniId: 15, amount: 40000, date: "2025-05-18", purpose: "Computer Lab", receiptNo: "MNPS/R/2025-26/0001" },
  { id: 8, alumniId: 10, amount: 30000, date: "2025-04-12", purpose: "General Fund", receiptNo: "MNPS/R/2025-26/0002" },
  { id: 9, alumniId: 19, amount: 25000, date: "2025-06-02", purpose: "General Fund", receiptNo: "MNPS/R/2025-26/0003" },
  { id: 10, alumniId: 20, amount: 15000, date: "2025-06-20", purpose: "Scholarship Fund", receiptNo: "MNPS/R/2025-26/0004" },
];

const SEED_CERTS = [
  { id: 1, alumniId: 1, certNo: "MNPS/CERT/2018/0007", date: "2018-06-12" },
  { id: 2, alumniId: 5, certNo: "MNPS/CERT/2019/0031", date: "2019-03-15" },
  { id: 3, alumniId: 11, certNo: "MNPS/CERT/2021/0088", date: "2021-04-10" },
];

const TIMELINE = [
  { year: "2015", title: "The Trust is founded", text: "MNPS Alumni Trust is registered under the Societies Registration Act with a founding council of 12 alumni, with the aim of reconnecting former students and giving back to the school." },
  { year: "2017", title: "First Annual Reunion", text: "Over 300 alumni return to campus for the inaugural reunion, establishing what is now a fixture in the school calendar." },
  { year: "2018", title: "Scholarship Programme launched", text: "A merit-cum-means scholarship supporting 20 students each year is set up, fully funded by alumni contributions." },
  { year: "2020", title: "COVID-19 Relief Drive", text: "The trust raises ₹18 lakh for oxygen concentrators for the local hospital and learning devices for students without access." },
  { year: "2022", title: "Digital Library inaugurated", text: "A new e-library and reading room opens, funded by the 2011 and 2016 batches." },
  { year: "2024", title: "New Auditorium built", text: "A 500-seat auditorium is completed, the trust's largest capital project to date." },
  { year: "2025", title: "1,000 members milestone", text: "Registered membership crosses one thousand alumni across six decades of graduating batches." },
];

/* ---------- helpers ---------- */
const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const inrPlain = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function amountToWords(num) {
  num = Math.floor(num);
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

/* ---------- reusable presentational bits ---------- */
/* Vector rendition of the trust crest (grad cap + open book + laurel wreath).
   In production, swap this for the supplied PNG served from /assets or Blob. */
function Crest({ size = 64, color = "var(--navy)" }) {
  const cx = 50, R = 33;
  const angs = [104, 80, 56, 32, 8, -16, -38];
  const leaves = [];
  angs.forEach((d, i) => {
    const a = (d * Math.PI) / 180;
    const x = cx + R * Math.cos(a);
    const y = 55 + R * Math.sin(a);
    const rx = 6.2 - i * 0.5, ry = 2.5;
    leaves.push({ x, y, rot: d - 90, rx, ry });
    leaves.push({ x: 2 * cx - x, y, rot: -(d - 90), rx, ry });
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ color, flexShrink: 0 }} aria-label="MNPS Alumni Trust crest">
      <g fill="currentColor">
        {leaves.map((l, i) => (
          <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M42,84 L50,88 M58,84 L50,88" />
      </g>
      {/* graduation cap */}
      <polygon points="50,13 80,25 50,33 20,25" fill="currentColor" />
      <path d="M35,29 L65,29 L60,41 Q50,46 40,41 Z" fill="currentColor" />
      <circle cx="50" cy="23" r="2" fill="var(--paper, #f4f0e6)" />
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M50,23 L74,26 L74,40" />
      </g>
      <ellipse cx="74" cy="42" rx="2.2" ry="3.4" fill="currentColor" />
      {/* open book */}
      <path d="M50,50 C41,47 31,47 23,50 L23,70 C31,67 41,67 50,70 Z" fill="currentColor" />
      <path d="M50,50 C59,47 69,47 77,50 L77,70 C69,67 59,67 50,70 Z" fill="currentColor" />
      <g stroke="var(--paper, #f4f0e6)" strokeWidth="1" fill="none" opacity="0.85">
        <path d="M28,55 C35,53 43,53 47,55" />
        <path d="M28,61 C35,59 43,59 47,61" />
        <path d="M53,55 C57,53 65,53 72,55" />
        <path d="M53,61 C57,59 65,59 72,61" />
      </g>
    </svg>
  );
}

function Seal({ size = 88, id = "seal" }) {
  const r = size / 2;
  const pr = r - 12;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="seal">
      <defs>
        <path id={id} d={`M ${r},${r} m -${pr},0 a ${pr},${pr} 0 1,1 ${pr * 2},0 a ${pr},${pr} 0 1,1 -${pr * 2},0`} fill="none" />
      </defs>
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
  const bg = BATCH_COLORS[batch] || "#556";
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>
      {initials(name)}
    </div>
  );
}

function Tag({ paid }) {
  return <span className={paid ? "tag tag-paid" : "tag tag-unpaid"}>{paid ? "Registered" : "Unregistered"}</span>;
}

/* ================================================================== */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [alumni, setAlumni] = useState(SEED_ALUMNI);
  const [donations, setDonations] = useState(SEED_DONATIONS);
  const [certs, setCerts] = useState(SEED_CERTS);
  const [modal, setModal] = useState(null); // {type, data}
  const [query, setQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [paidFilter, setPaidFilter] = useState("all");

  const batches = useMemo(() => [...new Set(alumni.map((a) => a.batch))].sort((x, y) => x - y), [alumni]);
  const alumniById = (id) => alumni.find((a) => a.id === id);

  /* ---- derived stats ---- */
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

  /* ---- actions ---- */
  const nextReceiptNo = () => {
    const y = new Date().getFullYear();
    const fy = `${y}-${String(y + 1).slice(2)}`;
    const n = donations.filter((d) => d.receiptNo.includes(fy)).length + 1;
    return `MNPS/R/${fy}/${String(n).padStart(4, "0")}`;
  };
  const nextCertNo = () => `MNPS/CERT/${new Date().getFullYear()}/${String(certs.length + 12).padStart(4, "0")}`;

  const recordDonation = (form) => {
    const rec = { id: Date.now(), alumniId: Number(form.alumniId), amount: Number(form.amount), date: form.date, purpose: form.purpose, receiptNo: nextReceiptNo() };
    setDonations((d) => [rec, ...d]);
    setModal({ type: "receipt", data: rec });
  };

  const togglePaid = (id) =>
    setAlumni((list) => list.map((a) => (a.id === id ? { ...a, paid: !a.paid } : a)));

  const issueCert = (alumniId) => {
    const rec = { id: Date.now(), alumniId: Number(alumniId), certNo: nextCertNo(), date: new Date().toISOString().slice(0, 10) };
    setCerts((c) => [rec, ...c]);
    setModal({ type: "certificate", data: rec });
  };

  const addAlumnus = (form) => {
    const rec = { id: Date.now(), ...form, batch: Number(form.batch), paid: form.paid === "true", join: new Date().toISOString().slice(0, 10), bio: form.bio || "" };
    setAlumni((a) => [rec, ...a]);
    setModal(null);
    setView("alumni");
  };

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
        <StatCard label="Registered Members" value={stats.paid} sub={`${Math.round((stats.paid / stats.total) * 100)}% of alumni`} icon={CheckCircle2} accent />
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
                <Bar dataKey="paid" stackId="a" fill="var(--ink)" name="Registered" radius={[0, 0, 0, 0]} />
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
                  {byBatch.map((e, i) => <Cell key={i} fill={BATCH_COLORS[Number(e.batch)]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Recent donations</h3><button className="btn-ghost" onClick={() => setView("donations")}>View all</button></div>
        <table className="table">
          <thead><tr><th>Receipt no.</th><th>Donor</th><th>Batch</th><th>Purpose</th><th className="right">Amount</th><th>Date</th></tr></thead>
          <tbody>
            {donations.slice(0, 5).map((d) => {
              const a = alumniById(d.alumniId);
              return <tr key={d.id}><td className="mono">{d.receiptNo}</td><td>{a?.name}</td><td>{a?.batch}</td><td>{d.purpose}</td><td className="right mono">{inr(d.amount)}</td><td className="muted">{fmtDate(d.date)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderAlumni = () => (
    <>
      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input placeholder="Search by name, organisation or city" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
          <option value="all">All batches</option>
          {batches.map((b) => <option key={b} value={b}>Batch of {b}</option>)}
        </select>
        <select value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
          <option value="all">All members</option>
          <option value="paid">Registered</option>
          <option value="unpaid">Unregistered</option>
        </select>
        <span className="count">{filteredAlumni.length} shown</span>
        <button className="btn" onClick={() => setModal({ type: "addAlumni" })}><Plus size={16} /> Add alumnus</button>
      </div>

      <div className="card-grid">
        {filteredAlumni.map((a) => (
          <div key={a.id} className="alumni-card" onClick={() => setModal({ type: "alumniDetail", data: a })}>
            <div className="ac-top">
              <Avatar name={a.name} batch={a.batch} size={52} />
              <div className="ac-id">
                <h4>{a.name}</h4>
                <span className="batch-chip" style={{ color: BATCH_COLORS[a.batch] }}>Batch of {a.batch}</span>
              </div>
              <Tag paid={a.paid} />
            </div>
            <div className="ac-meta">
              <span>{a.occ === "Business" ? <Building2 size={14} /> : <Briefcase size={14} />}{a.role}, {a.org}</span>
              <span><MapPin size={14} />{a.city}, {a.country}</span>
              <span><Heart size={14} />{a.marital}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderBatches = () => (
    <div className="batch-grid">
      {byBatch.map((b) => {
        const members = alumni.filter((a) => a.batch === Number(b.batch));
        return (
          <div key={b.batch} className="batch-card" onClick={() => { setBatchFilter(b.batch); setPaidFilter("all"); setQuery(""); setView("alumni"); }}>
            <div className="batch-head">
              <div>
                <span className="batch-eyebrow">Class of</span>
                <div className="batch-year" style={{ color: BATCH_COLORS[Number(b.batch)] }}>{b.batch}</div>
              </div>
              <div className="batch-nums">
                <div><strong>{b.total}</strong><span>members</span></div>
                <div><strong>{b.paid}</strong><span>registered</span></div>
              </div>
            </div>
            <div className="cluster">
              {members.slice(0, 7).map((m) => (
                <div key={m.id} className="cluster-av" title={m.name}><Avatar name={m.name} batch={m.batch} size={38} /></div>
              ))}
              {members.length > 7 && <div className="cluster-more">+{members.length - 7}</div>}
            </div>
            <div className="batch-foot">
              <span><HeartHandshake size={14} /> {inr(b.don)} raised</span>
              <span className="link">View batch →</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDonations = () => (
    <>
      <div className="toolbar">
        <div className="tb-summary">
          <div><span className="muted">Total raised</span><strong>{inr(stats.totalDon)}</strong></div>
          <div><span className="muted">Donors</span><strong>{stats.donors}</strong></div>
          <div><span className="muted">Receipts issued</span><strong>{donations.length}</strong></div>
        </div>
        <button className="btn" onClick={() => setModal({ type: "recordDonation" })}><Plus size={16} /> Record donation</button>
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Receipt no.</th><th>Donor</th><th>Batch</th><th>Purpose</th><th className="right">Amount</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {donations.map((d) => {
              const a = alumniById(d.alumniId);
              return (
                <tr key={d.id}>
                  <td className="mono">{d.receiptNo}</td>
                  <td>{a?.name}</td><td>{a?.batch}</td><td>{d.purpose}</td>
                  <td className="right mono">{inr(d.amount)}</td>
                  <td className="muted">{fmtDate(d.date)}</td>
                  <td className="right"><button className="btn-ghost" onClick={() => setModal({ type: "receipt", data: d })}><Printer size={14} /> Receipt</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderCertificates = () => (
    <>
      <div className="toolbar">
        <span className="count">{certs.length} certificates issued · certificates are issued to registered (paid) members only</span>
        <button className="btn" onClick={() => setModal({ type: "issueCert" })}><Plus size={16} /> Issue certificate</button>
      </div>
      <div className="panel">
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
          </tbody>
        </table>
      </div>
    </>
  );

  const renderTimeline = () => (
    <div className="timeline">
      <div className="tl-intro">
        <Crest size={70} color="var(--navy)" />
        <div>
          <h2>{TRUST.tagline} — a decade of giving back</h2>
          <p className="muted">Milestones of the {TRUST.name} since its founding in {TRUST.estd}.</p>
        </div>
      </div>
      <div className="tl-line">
        {TIMELINE.map((t, i) => (
          <div className="tl-item" key={i}>
            <div className="tl-dot" />
            <div className="tl-year">{t.year}</div>
            <div className="tl-body">
              <h4>{t.title}</h4>
              <p>{t.text}</p>
            </div>
          </div>
        ))}
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
            <div>
              <h2>{a.name}</h2>
              <span className="batch-chip" style={{ color: BATCH_COLORS[a.batch] }}>Batch of {a.batch}</span>
            </div>
            <Tag paid={a.paid} />
          </div>
          <div className="detail-grid">
            <Field icon={a.occ === "Business" ? Building2 : Briefcase} label={a.occ === "Business" ? "Business" : "Occupation"} value={`${a.role}, ${a.org}`} />
            <Field icon={MapPin} label="Located in" value={`${a.city}, ${a.country}`} />
            <Field icon={Heart} label="Marital status" value={a.marital} />
            <Field icon={Calendar} label="Member since" value={fmtDate(a.join)} />
            <Field icon={Mail} label="Email" value={a.email} />
            <Field icon={Phone} label="Phone" value={a.phone} />
            <Field icon={HeartHandshake} label="Lifetime donations" value={inr(donTotal)} />
            <Field icon={Award} label="Certificate" value={hasCert ? "Issued" : "Not issued"} />
          </div>
          {a.bio && <p className="bio">{a.bio}</p>}
          <div className="detail-actions">
            <button className="btn-ghost" onClick={() => togglePaid(a.id)}>
              {a.paid ? <><Circle size={15} /> Mark as unregistered</> : <><CheckCircle2 size={15} /> Mark as registered</>}
            </button>
            {a.paid ? (
              hasCert
                ? <button className="btn" onClick={() => setModal({ type: "certificate", data: certs.find((c) => c.alumniId === a.id) })}><Award size={16} /> View certificate</button>
                : <button className="btn" onClick={() => issueCert(a.id)}><Award size={16} /> Issue certificate</button>
            ) : <span className="hint">Mark the member as registered once their fee is received to enable the certificate.</span>}
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

    const wide = modal.type === "certificate";
    return (
      <div className="overlay" onClick={closeModal}>
        <div className={`modal ${wide ? "modal-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}><X size={18} /></button>
          {inner}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <style>{CSS}</style>

      <aside className="sidebar">
        <div className="brand">
          <Crest size={44} color="var(--brass)" />
          <div className="brand-txt"><strong>MNPS</strong><span>Alumni Trust</span><em>{TRUST.tagline}</em></div>
        </div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? "nav active" : "nav"} onClick={() => setView(n.id)}>
              <n.icon size={18} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <Landmark size={14} /> Admin Portal
          <span>{TRUST.school}</span>
          <span>Jamshedpur · Est. {TRUST.estd}</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>{titles[view]}</h1>
          {batchFilter !== "all" && view === "alumni" && (
            <button className="filter-pill" onClick={() => setBatchFilter("all")}>Batch of {batchFilter} <X size={13} /></button>
          )}
        </header>
        <div className="content">
          {view === "dashboard" && renderDashboard()}
          {view === "alumni" && renderAlumni()}
          {view === "batches" && renderBatches()}
          {view === "donations" && renderDonations()}
          {view === "certificates" && renderCertificates()}
          {view === "timeline" && renderTimeline()}
        </div>
      </main>

      {renderModal()}
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
  return (
    <div className="field"><Icon size={15} /><div><span>{label}</span><strong>{value}</strong></div></div>
  );
}

function ReceiptDoc({ rec, alumni }) {
  return (
    <div className="doc receipt">
      <div className="doc-head">
        <Crest size={62} color="var(--navy)" />
        <div className="doc-title">
          <h2>{TRUST.name}</h2>
          <span>{TRUST.school} · {TRUST.address}</span>
          <span className="doc-type">Donation Receipt</span>
        </div>
      </div>
      <div className="rcpt-meta">
        <div><span>Receipt no.</span><strong className="mono">{rec.receiptNo}</strong></div>
        <div><span>Date</span><strong>{fmtDate(rec.date)}</strong></div>
      </div>
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
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.alumniId && Number(f.amount) > 0;
  return (
    <div className="form">
      <h2>Record donation</h2>
      <p className="muted">A receipt will be generated automatically.</p>
      <label>Donor
        <select value={f.alumniId} onChange={set("alumniId")}>
          {alumni.map((a) => <option key={a.id} value={a.id}>{a.name} — Batch of {a.batch}</option>)}
        </select>
      </label>
      <label>Amount (₹)<input type="number" min="1" placeholder="e.g. 25000" value={f.amount} onChange={set("amount")} /></label>
      <label>Purpose
        <select value={f.purpose} onChange={set("purpose")}>
          {["Scholarship Fund", "General Fund", "Library Renovation", "Sports Equipment", "Medical Camp", "Computer Lab", "New Auditorium"].map((p) => <option key={p}>{p}</option>)}
        </select>
      </label>
      <label>Date<input type="date" value={f.date} onChange={set("date")} /></label>
      <button className="btn" disabled={!ok} onClick={() => onSubmit(f)}><HeartHandshake size={16} /> Record & issue receipt</button>
    </div>
  );
}

function IssueCertForm({ alumni, onSubmit }) {
  const [id, setId] = useState(alumni[0]?.id || "");
  return (
    <div className="form">
      <h2>Issue membership certificate</h2>
      {alumni.length === 0
        ? <p className="muted">Every registered member already has a certificate. Certificates can only be issued to members who have completed registration.</p>
        : (
          <>
            <p className="muted">Only registered (paid) members without an existing certificate are listed.</p>
            <label>Member
              <select value={id} onChange={(e) => setId(e.target.value)}>
                {alumni.map((a) => <option key={a.id} value={a.id}>{a.name} — Batch of {a.batch}</option>)}
              </select>
            </label>
            <button className="btn" disabled={!id} onClick={() => onSubmit(id)}><Award size={16} /> Issue certificate</button>
          </>
        )}
    </div>
  );
}

function AddAlumniForm({ batches, onSubmit }) {
  const [f, setF] = useState({ name: "", batch: batches[0], occ: "Job", org: "", role: "", city: "", country: "India", marital: "Single", paid: "false", email: "", phone: "", bio: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.name && f.org && f.city;
  return (
    <div className="form form-wide">
      <h2>Add alumnus</h2>
      <div className="form-row">
        <label>Full name<input value={f.name} onChange={set("name")} placeholder="e.g. Ananya Rao" /></label>
        <label>Batch<select value={f.batch} onChange={set("batch")}>{batches.map((b) => <option key={b}>{b}</option>)}</select></label>
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
      <button className="btn" disabled={!ok} onClick={() => onSubmit(f)}><Plus size={16} /> Add to directory</button>
    </div>
  );
}

/* ================= STYLES ================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root{
  --ink:#152641; --ink-soft:#22375a; --navy:#23425e; --paper:#f4f0e6; --brass:#bb9648; --brass-2:#a37f34;
  --stone:#e9e5db; --card:#ffffff; --line:#e4dfd2; --text:#1c2735; --muted:#6a7688;
  --paid:#2f7d5b; --paid-bg:#e6f2ec; --unpaid:#9c6b1f; --unpaid-bg:#f6ecd8;
}
*{box-sizing:border-box}
.app{display:flex; min-height:100vh; background:var(--stone); color:var(--text);
  font-family:'Inter',system-ui,sans-serif; font-size:14px; line-height:1.5;}
.mono{font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums;}
h1,h2,h3,h4{font-family:'Fraunces',Georgia,serif; margin:0; color:var(--ink); font-weight:600; letter-spacing:-.01em;}
.muted{color:var(--muted)}
button{font-family:inherit; cursor:pointer;}

/* sidebar */
.sidebar{width:236px; background:var(--ink); color:#cfd8e6; display:flex; flex-direction:column; padding:20px 14px; position:sticky; top:0; height:100vh; flex-shrink:0;}
.brand{display:flex; align-items:center; gap:11px; padding:4px 8px 22px;}
.brand-txt{display:flex; flex-direction:column; line-height:1.1}
.brand-txt strong{font-family:'Fraunces',serif; color:#fff; font-size:19px; letter-spacing:.02em}
.brand-txt span{font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--brass)}
.brand-txt em{font-style:italic; font-family:'Fraunces',serif; font-size:11px; color:#9fb0c9; margin-top:2px; letter-spacing:.01em}
nav{display:flex; flex-direction:column; gap:3px; flex:1}
.nav{display:flex; align-items:center; gap:11px; padding:10px 12px; border:none; background:none; color:#aeb9cc; border-radius:9px; text-align:left; font-size:13.5px; font-weight:500; transition:.15s}
.nav:hover{background:rgba(255,255,255,.06); color:#fff}
.nav.active{background:var(--brass); color:#1a1200; font-weight:600}
.side-foot{font-size:11px; color:#8494ab; padding:14px 10px 4px; border-top:1px solid rgba(255,255,255,.08); display:flex; flex-direction:column; gap:3px}
.side-foot{align-items:flex-start}
.side-foot > :first-child{display:flex; gap:6px; align-items:center; color:var(--brass); text-transform:uppercase; letter-spacing:.12em; font-size:10px}

/* main */
.main{flex:1; min-width:0; display:flex; flex-direction:column}
.topbar{display:flex; align-items:center; gap:14px; padding:22px 32px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.55); position:sticky; top:0; z-index:5; backdrop-filter:blur(6px)}
.topbar h1{font-size:24px}
.filter-pill{display:flex; align-items:center; gap:6px; background:var(--ink); color:#fff; border:none; padding:5px 11px; border-radius:20px; font-size:12px}
.content{padding:26px 32px 60px; max-width:1180px; width:100%}

/* stats */
.stat-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:22px}
.stat{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px}
.stat.accent{background:var(--ink); border-color:var(--ink)}
.stat.accent .stat-val,.stat.accent .stat-lbl{color:#fff}
.stat.accent .stat-sub{color:#9fb0c9}
.stat.accent .stat-ic{background:var(--brass); color:#1a1200}
.stat-ic{width:34px; height:34px; border-radius:9px; background:var(--stone); color:var(--ink); display:flex; align-items:center; justify-content:center; margin-bottom:12px}
.stat-val{font-family:'Fraunces',serif; font-size:27px; font-weight:600; color:var(--ink); line-height:1}
.stat-lbl{font-weight:600; margin-top:6px; font-size:13px}
.stat-sub{color:var(--muted); font-size:12px; margin-top:2px}

/* panels */
.two-col{display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px}
.panel{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 20px; margin-bottom:16px}
.panel-head{display:flex; align-items:baseline; justify-content:space-between; margin-bottom:14px}
.panel-head h3{font-size:16px}
.panel-head .muted{font-size:12px}

/* tables */
.table{width:100%; border-collapse:collapse; font-size:13px}
.table th{text-align:left; color:var(--muted); font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.06em; padding:8px 10px; border-bottom:1px solid var(--line)}
.table td{padding:11px 10px; border-bottom:1px solid #f1eee4}
.table tr:last-child td{border-bottom:none}
.right{text-align:right}

/* buttons */
.btn{display:inline-flex; align-items:center; gap:7px; background:var(--ink); color:#fff; border:none; padding:9px 15px; border-radius:9px; font-weight:600; font-size:13px; transition:.15s}
.btn:hover{background:var(--ink-soft)}
.btn:disabled{opacity:.4; cursor:not-allowed}
.btn-ghost{display:inline-flex; align-items:center; gap:6px; background:none; border:1px solid var(--line); color:var(--ink); padding:6px 11px; border-radius:8px; font-size:12.5px; font-weight:500}
.btn-ghost:hover{border-color:var(--brass); color:var(--brass-2)}

/* toolbar */
.toolbar{display:flex; align-items:center; gap:12px; margin-bottom:18px; flex-wrap:wrap}
.search{display:flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--line); border-radius:9px; padding:0 12px; flex:1; min-width:240px; color:var(--muted)}
.search input{border:none; outline:none; padding:10px 0; font-size:13.5px; width:100%; background:none; color:var(--text); font-family:inherit}
.toolbar select{background:var(--card); border:1px solid var(--line); border-radius:9px; padding:9px 12px; font-size:13px; color:var(--text); font-family:inherit}
.count{font-size:12.5px; color:var(--muted)}
.tb-summary{display:flex; gap:26px; flex:1}
.tb-summary div{display:flex; flex-direction:column}
.tb-summary strong{font-family:'Fraunces',serif; font-size:20px; color:var(--ink)}
.tb-summary span{font-size:12px}

/* alumni cards */
.card-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px}
.alumni-card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; cursor:pointer; transition:.15s}
.alumni-card:hover{border-color:var(--brass); box-shadow:0 6px 22px rgba(21,38,65,.07); transform:translateY(-2px)}
.ac-top{display:flex; align-items:center; gap:12px; margin-bottom:13px}
.ac-id{flex:1; min-width:0}
.ac-id h4{font-size:15.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.batch-chip{font-size:11px; font-weight:600; letter-spacing:.03em}
.ac-meta{display:flex; flex-direction:column; gap:6px; font-size:12.5px; color:var(--text)}
.ac-meta span{display:flex; align-items:center; gap:7px; color:#41505f}
.ac-meta svg{color:var(--muted); flex-shrink:0}
.avatar{border-radius:50%; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-family:'Inter',sans-serif; flex-shrink:0}

/* tags */
.tag{font-size:10.5px; font-weight:600; padding:4px 9px; border-radius:20px; letter-spacing:.03em; white-space:nowrap}
.tag-paid{background:var(--paid-bg); color:var(--paid)}
.tag-unpaid{background:var(--unpaid-bg); color:var(--unpaid)}

/* batches */
.batch-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px}
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

/* timeline */
.timeline{max-width:760px}
.tl-intro{display:flex; align-items:center; gap:18px; margin-bottom:30px}
.tl-intro h2{font-size:26px}
.tl-line{position:relative; padding-left:26px}
.tl-line:before{content:""; position:absolute; left:6px; top:6px; bottom:6px; width:2px; background:linear-gradient(var(--brass),var(--line))}
.tl-item{position:relative; padding:0 0 26px 22px}
.tl-dot{position:absolute; left:-26px; top:4px; width:14px; height:14px; border-radius:50%; background:var(--brass); border:3px solid var(--stone); box-shadow:0 0 0 2px var(--brass)}
.tl-year{font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:600; color:var(--brass-2); letter-spacing:.04em}
.tl-body h4{font-size:17px; margin:2px 0 5px}
.tl-body p{color:#41505f; font-size:13.5px; margin:0}

/* overlay + modal */
.overlay{position:fixed; inset:0; background:rgba(15,26,45,.5); backdrop-filter:blur(3px); display:flex; align-items:flex-start; justify-content:center; padding:40px 20px; overflow-y:auto; z-index:50}
.modal{background:var(--card); border-radius:16px; width:100%; max-width:520px; padding:26px; position:relative; box-shadow:0 24px 60px rgba(0,0,0,.28)}
.modal-wide{max-width:720px}
.modal-close{position:absolute; top:14px; right:14px; background:var(--stone); border:none; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--ink)}
.modal-close:hover{background:var(--line)}

/* detail */
.detail-head{display:flex; align-items:center; gap:14px; margin-bottom:20px}
.detail-head h2{font-size:22px}
.detail-head > :last-child{margin-left:auto}
.detail-grid{display:grid; grid-template-columns:1fr 1fr; gap:14px 22px; margin-bottom:16px}
.field{display:flex; gap:10px; align-items:flex-start}
.field svg{color:var(--brass-2); margin-top:2px; flex-shrink:0}
.field span{display:block; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em}
.field strong{font-weight:600; font-size:13.5px}
.bio{background:var(--stone); border-radius:10px; padding:12px 14px; font-size:13px; color:#41505f; margin:0 0 18px}
.detail-actions{display:flex; gap:10px; flex-wrap:wrap; border-top:1px solid var(--line); padding-top:18px}
.hint{font-size:12.5px; color:var(--unpaid); background:var(--unpaid-bg); padding:10px 12px; border-radius:9px; flex:1}

/* forms */
.form{display:flex; flex-direction:column; gap:14px}
.form h2{font-size:21px}
.form > .muted{margin-top:-8px; font-size:12.5px}
.form label{display:flex; flex-direction:column; gap:5px; font-size:12px; font-weight:600; color:var(--ink)}
.form input,.form select,.form textarea{border:1px solid var(--line); border-radius:9px; padding:10px 12px; font-size:13.5px; font-family:inherit; color:var(--text); background:#fff; font-weight:400}
.form input:focus,.form select:focus,.form textarea:focus{outline:none; border-color:var(--brass)}
.form .btn{margin-top:4px; justify-content:center}
.form-row{display:flex; gap:12px}
.form-row label{flex:1}
.form-wide{max-width:100%}

/* documents (receipt / certificate) */
.doc{display:flex; flex-direction:column}
.doc-head{display:flex; align-items:center; gap:16px; padding-bottom:16px; border-bottom:2px solid var(--brass)}
.doc-title h2{font-size:22px}
.doc-title span{display:block; font-size:11px; color:var(--muted); letter-spacing:.06em}
.doc-type{margin-top:6px; font-family:'IBM Plex Mono',monospace; color:var(--brass-2)!important; text-transform:uppercase; letter-spacing:.1em; font-size:11px!important}
.receipt .rcpt-meta{display:flex; justify-content:space-between; margin:18px 0}
.rcpt-meta div{display:flex; flex-direction:column}
.rcpt-meta span{font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em}
.rcpt-meta strong{font-size:14px; margin-top:2px}
.rcpt-line{font-size:14.5px; line-height:1.7; margin:0 0 6px}
.rcpt-words{font-style:italic; color:var(--brass-2); font-family:'Fraunces',serif; font-size:14px; margin:0 0 16px}
.rcpt-amount{display:flex; justify-content:space-between; align-items:center; background:var(--stone); border-radius:10px; padding:14px 16px; margin-bottom:14px}
.rcpt-amount span{font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted)}
.rcpt-amount strong{font-size:22px; color:var(--ink); font-weight:600}
.rcpt-80g{font-size:11px; color:var(--muted); line-height:1.5; margin:0 0 20px}
.doc-contact{font-size:10.5px; color:var(--muted); text-align:center; letter-spacing:.02em; border-top:1px solid var(--line); padding-top:10px; margin:0 0 18px}
.cert-motto{font-family:'Fraunces',serif; font-style:italic; font-size:13px; color:var(--brass-2); margin:14px 0 0}
.cert-stamp{position:absolute; left:50%; bottom:56px; transform:translateX(-50%); opacity:.1; pointer-events:none; z-index:0}
.cert-inner{position:relative}
.cert-foot{position:relative; z-index:1}
.doc-sign{display:flex; flex-direction:column; align-items:flex-end; margin-bottom:16px}
.doc-sign.center{align-items:center; margin:0}
.sign-line{width:150px; border-top:1px solid var(--ink); margin-bottom:5px}
.doc-sign span{font-size:11px; color:var(--muted)}
.print{align-self:flex-start; justify-content:center}

/* certificate */
.cert-border{border:2px solid var(--brass); border-radius:6px; padding:6px}
.cert-inner{border:1px solid var(--brass); border-radius:4px; padding:34px 40px; text-align:center; display:flex; flex-direction:column; align-items:center; background:linear-gradient(180deg,#fffdf8,#fbf7ec)}
.cert-org{font-size:26px; margin-top:12px; color:var(--ink)}
.cert-sub{font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--brass-2); margin-top:3px}
.cert-rule{width:60px; height:2px; background:var(--brass); margin:16px 0}
.cert-kicker{font-family:'IBM Plex Mono',monospace; text-transform:uppercase; letter-spacing:.22em; font-size:12px; color:var(--brass-2); margin:0}
.cert-text{font-size:14px; color:#41505f; margin:10px 0; max-width:440px; line-height:1.7}
.cert-name{font-family:'Fraunces',serif; font-size:34px; color:var(--ink); font-weight:600; margin:6px 0}
.cert-foot{display:flex; justify-content:space-between; align-items:flex-end; width:100%; margin-top:30px}
.cert-foot > div{display:flex; flex-direction:column; align-items:center; gap:2px}
.cert-foot span{font-size:13px; font-weight:600; color:var(--ink)}
.cert-foot small{font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em}
.doc .print{margin-top:20px}

@media (max-width:900px){
  .stat-grid{grid-template-columns:repeat(2,1fr)}
  .two-col{grid-template-columns:1fr}
  .sidebar{width:64px; padding:16px 8px}
  .brand-txt,.nav span,.side-foot span{display:none}
  .nav{justify-content:center}
}
@media (max-width:560px){
  .content{padding:18px}
  .topbar{padding:16px 18px}
  .detail-grid{grid-template-columns:1fr}
  .form-row{flex-direction:column}
  .cert-inner{padding:22px}
}
`;
