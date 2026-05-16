import { useState, useMemo } from "react";

const initialForm = {
  // Freelancer
  freelancerName: "",
  freelancerAddress: "",
  freelancerPhone: "",
  freelancerEmail: "",
  freelancerPAN: "",
  // Client
  clientName: "",
  clientAddress: "",
  contactPerson: "",
  // Project
  projectTitle: "",
  scopeOfWork: "",
  totalCost: "",
  advanceAmount: "",
  paymentMethod: "NEFT/RTGS",
  startDate: "",
  deliveryDate: "",
  revisionRounds: "2",
  // Document meta
  docDate: "",
  docNumber: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "___________";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const formatCurrency = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 0 });
};

const numberToWords = (num) => {
  if (!num || isNaN(num)) return "";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  };
  return inWords(parseInt(num)) + " Rupees Only";
};

const ScopeList = ({ scope }) => {
  const lines = scope.split("\n").map(s => s.trim()).filter(Boolean);
  return (
    <ol style={{ margin: "8px 0 8px 20px", padding: 0, lineHeight: "1.8" }}>
      {lines.map((l, i) => <li key={i} style={{ marginBottom: "2px" }}>{l}</li>)}
    </ol>
  );
};

const DocHeader = ({ title, number, date, freelancer }) => (
  <div style={{ borderBottom: "3px double #1a1a2e", paddingBottom: "16px", marginBottom: "20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e", letterSpacing: "-0.5px", fontFamily: "'Georgia', serif" }}>
          {freelancer.name || "Your Name"}
        </div>
        <div style={{ fontSize: "11px", color: "#555", marginTop: "3px", lineHeight: "1.6" }}>
          {freelancer.address && <div>{freelancer.address}</div>}
          {freelancer.phone && <span>📞 {freelancer.phone}</span>}
          {freelancer.phone && freelancer.email && <span style={{ margin: "0 8px" }}>·</span>}
          {freelancer.email && <span>✉ {freelancer.email}</span>}
          {freelancer.pan && <div style={{ marginTop: "2px" }}>PAN: {freelancer.pan}</div>}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          background: "#1a1a2e", color: "#fff", padding: "6px 14px",
          fontSize: "13px", fontWeight: "700", letterSpacing: "1px",
          textTransform: "uppercase", borderRadius: "4px", marginBottom: "6px"
        }}>{title}</div>
        <div style={{ fontSize: "11px", color: "#444" }}>
          <div><strong>No:</strong> {number || "—"}</div>
          <div><strong>Date:</strong> {formatDate(date)}</div>
        </div>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase",
    color: "#1a1a2e", borderBottom: "1px solid #1a1a2e", paddingBottom: "4px",
    marginBottom: "10px", marginTop: "18px"
  }}>{children}</div>
);

const TwoCol = ({ label, value }) => (
  <div style={{ display: "flex", marginBottom: "4px", fontSize: "12px" }}>
    <span style={{ width: "160px", color: "#555", flexShrink: 0 }}>{label}</span>
    <span style={{ color: "#1a1a2e", fontWeight: "500" }}>{value || "—"}</span>
  </div>
);

const SignatureBlock = ({ parties }) => (
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", gap: "30px" }}>
    {parties.map((p, i) => (
      <div key={i} style={{ flex: 1 }}>
        <div style={{ height: "48px", borderBottom: "1px solid #999", marginBottom: "6px" }}></div>
        <div style={{ fontSize: "11px", color: "#333" }}>
          <div style={{ fontWeight: "700" }}>{p.name}</div>
          <div style={{ color: "#666" }}>{p.role}</div>
          <div style={{ marginTop: "4px" }}>Date: ___________</div>
        </div>
      </div>
    ))}
  </div>
);

const PricingTable = ({ total, advance, balance }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "8px" }}>
    <thead>
      <tr style={{ background: "#1a1a2e", color: "#fff" }}>
        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600" }}>Description</th>
        <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: "600" }}>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr style={{ background: "#f8f8f8" }}>
        <td style={{ padding: "8px 12px", borderBottom: "1px solid #e0e0e0" }}>Total Project Cost</td>
        <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e0e0e0" }}>{formatCurrency(total)}</td>
      </tr>
      <tr>
        <td style={{ padding: "8px 12px", borderBottom: "1px solid #e0e0e0", color: "#2a7a3b" }}>Advance Payment (on confirmation)</td>
        <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e0e0e0", color: "#2a7a3b" }}>{formatCurrency(advance)}</td>
      </tr>
      <tr style={{ background: "#f8f8f8" }}>
        <td style={{ padding: "8px 12px", borderBottom: "2px solid #1a1a2e", color: "#c0392b" }}>Balance Payment (on delivery)</td>
        <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "2px solid #1a1a2e", color: "#c0392b" }}>{formatCurrency(balance)}</td>
      </tr>
      <tr>
        <td style={{ padding: "10px 12px", fontWeight: "700", fontSize: "13px" }}>Grand Total</td>
        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", fontSize: "13px" }}>{formatCurrency(total)}</td>
      </tr>
    </tbody>
  </table>
);

// ── QUOTATION DOCUMENT ──────────────────────────────────────────────
const QuotationDoc = ({ f }) => {
  const balance = (parseFloat(f.totalCost) || 0) - (parseFloat(f.advanceAmount) || 0);
  return (
    <div>
      <DocHeader title="Quotation" number={f.docNumber} date={f.docDate}
        freelancer={{ name: f.freelancerName, address: f.freelancerAddress, phone: f.freelancerPhone, email: f.freelancerEmail, pan: f.freelancerPAN }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "4px" }}>
        <div>
          <SectionTitle>To</SectionTitle>
          <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
            <div style={{ fontWeight: "700", fontSize: "13px" }}>{f.clientName || "Client Organisation"}</div>
            {f.contactPerson && <div>Attn: {f.contactPerson}</div>}
            <div style={{ color: "#555", whiteSpace: "pre-line" }}>{f.clientAddress}</div>
          </div>
        </div>
        <div>
          <SectionTitle>From</SectionTitle>
          <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
            <div style={{ fontWeight: "700", fontSize: "13px" }}>{f.freelancerName || "Your Name"}</div>
            <div style={{ color: "#555", whiteSpace: "pre-line" }}>{f.freelancerAddress}</div>
            {f.freelancerPAN && <div>PAN: {f.freelancerPAN}</div>}
          </div>
        </div>
      </div>

      <SectionTitle>Project</SectionTitle>
      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>
        {f.projectTitle || "Project Title"}
      </div>
      <div style={{ fontSize: "11px", color: "#666", display: "flex", gap: "24px" }}>
        <span>Start: {formatDate(f.startDate)}</span>
        <span>Delivery: {formatDate(f.deliveryDate)}</span>
        <span>Revisions: {f.revisionRounds} rounds included</span>
      </div>

      <SectionTitle>Scope of Work</SectionTitle>
      <div style={{ fontSize: "12px" }}>
        {f.scopeOfWork ? <ScopeList scope={f.scopeOfWork} /> : <p style={{ color: "#999" }}>Add scope of work items above...</p>}
      </div>

      <SectionTitle>Pricing</SectionTitle>
      <PricingTable total={f.totalCost} advance={f.advanceAmount} balance={balance} />
      <div style={{ fontSize: "11px", color: "#666", marginTop: "6px", fontStyle: "italic" }}>
        In words: {numberToWords(f.totalCost)}
      </div>

      <SectionTitle>Terms & Conditions</SectionTitle>
      <div style={{ fontSize: "11px", lineHeight: "1.9", color: "#333" }}>
        <div>1. This quotation is valid for <strong>15 days</strong> from the date of issue.</div>
        <div>2. An advance of {formatCurrency(f.advanceAmount)} is required to initiate the project.</div>
        <div>3. Balance payment of {formatCurrency(balance)} is due upon project delivery/handover.</div>
        <div>4. {f.revisionRounds || "2"} rounds of revisions are included. Additional revisions will be billed separately.</div>
        <div>5. Preferred payment mode: <strong>{f.paymentMethod}</strong>.</div>
        <div>6. Content, images, and materials required for the website must be provided by the client.</div>
        <div>7. This is a non-GST invoice. Annual turnover is below ₹20,00,000.</div>
      </div>

      <SignatureBlock parties={[
        { name: f.freelancerName || "Freelancer Name", role: "Web Developer / Designer" },
        { name: f.contactPerson || "Authorised Signatory", role: f.clientName || "Client Organisation" }
      ]} />
    </div>
  );
};

// ── WORK ORDER DOCUMENT ─────────────────────────────────────────────
const WorkOrderDoc = ({ f }) => {
  const balance = (parseFloat(f.totalCost) || 0) - (parseFloat(f.advanceAmount) || 0);
  return (
    <div>
      <DocHeader title="Work Order / Service Agreement" number={f.docNumber} date={f.docDate}
        freelancer={{ name: f.freelancerName, address: f.freelancerAddress, phone: f.freelancerPhone, email: f.freelancerEmail, pan: f.freelancerPAN }} />

      <div style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "6px", padding: "14px 16px", fontSize: "12px", marginBottom: "4px", lineHeight: "1.9" }}>
        This Service Agreement ("Agreement") is entered into on <strong>{formatDate(f.docDate)}</strong> between:
        <div style={{ margin: "8px 0 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ padding: "10px", background: "#fff", borderRadius: "4px", border: "1px solid #e0e0e0" }}>
            <div style={{ fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>Party A — Service Provider</div>
            <div>{f.freelancerName || "Your Name"}</div>
            <div style={{ color: "#666", whiteSpace: "pre-line" }}>{f.freelancerAddress}</div>
            {f.freelancerPhone && <div>Ph: {f.freelancerPhone}</div>}
            {f.freelancerPAN && <div>PAN: {f.freelancerPAN}</div>}
          </div>
          <div style={{ padding: "10px", background: "#fff", borderRadius: "4px", border: "1px solid #e0e0e0" }}>
            <div style={{ fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>Party B — Client</div>
            <div>{f.clientName || "Client Organisation"}</div>
            <div style={{ color: "#666", whiteSpace: "pre-line" }}>{f.clientAddress}</div>
            {f.contactPerson && <div>Contact: {f.contactPerson}</div>}
          </div>
        </div>
      </div>

      <SectionTitle>1. Project Details</SectionTitle>
      <TwoCol label="Project Title" value={f.projectTitle} />
      <TwoCol label="Project Start Date" value={formatDate(f.startDate)} />
      <TwoCol label="Expected Delivery Date" value={formatDate(f.deliveryDate)} />
      <TwoCol label="Total Project Cost" value={formatCurrency(f.totalCost)} />

      <SectionTitle>2. Scope of Work</SectionTitle>
      <div style={{ fontSize: "12px" }}>
        The Service Provider agrees to deliver the following:
        {f.scopeOfWork ? <ScopeList scope={f.scopeOfWork} /> : <p style={{ color: "#999" }}>Add scope of work items...</p>}
      </div>

      <SectionTitle>3. Payment Schedule</SectionTitle>
      <PricingTable total={f.totalCost} advance={f.advanceAmount} balance={balance} />
      <div style={{ fontSize: "11px", color: "#555", marginTop: "8px", lineHeight: "1.8" }}>
        <div>• Advance of {formatCurrency(f.advanceAmount)} is payable upon signing this agreement to initiate work.</div>
        <div>• Balance of {formatCurrency(balance)} is payable upon completion and handover of the final project.</div>
        <div>• Preferred payment method: <strong>{f.paymentMethod}</strong>.</div>
      </div>

      <SectionTitle>4. Revision Policy</SectionTitle>
      <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
        This agreement includes <strong>{f.revisionRounds || "2"} round(s)</strong> of revisions at no additional cost. A revision round refers to a consolidated set of change requests submitted at one time. Revisions beyond the included rounds will be quoted and billed separately.
      </div>

      <SectionTitle>5. Ownership & Intellectual Property</SectionTitle>
      <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
        Upon receipt of full and final payment, all rights, titles, and interests in the completed website and associated deliverables shall be transferred to {f.clientName || "the Client"}. Until full payment is received, the Service Provider retains all rights over the work.
      </div>

      <SectionTitle>6. Client Responsibilities</SectionTitle>
      <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
        The Client agrees to provide all necessary content (text, images, logos, and other materials) in a timely manner. Delays in providing content may result in a corresponding delay to the delivery date.
      </div>

      <SectionTitle>7. Termination</SectionTitle>
      <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
        Either party may terminate this agreement with <strong>7 days written notice</strong>. In such event, the Client shall pay for all work completed up to the date of termination. The advance amount is non-refundable once work has commenced.
      </div>

      <SectionTitle>8. Limitation of Liability</SectionTitle>
      <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#333" }}>
        The Service Provider's liability is limited to the total project cost. The Service Provider is not liable for indirect, incidental, or consequential damages arising from this agreement.
      </div>

      <div style={{ marginTop: "16px", padding: "10px 14px", background: "#fffbea", border: "1px solid #f0d060", borderRadius: "4px", fontSize: "11px", color: "#6b5c00" }}>
        By signing below, both parties acknowledge that they have read, understood, and agree to the terms of this Service Agreement.
      </div>

      <SignatureBlock parties={[
        { name: f.freelancerName || "Freelancer Name", role: "Web Developer / Designer (Party A)" },
        { name: f.contactPerson || "Authorised Signatory", role: `${f.clientName || "Client Organisation"} (Party B)` }
      ]} />
    </div>
  );
};

// ── INVOICE DOCUMENT ────────────────────────────────────────────────
const InvoiceDoc = ({ f }) => {
  const balance = (parseFloat(f.totalCost) || 0) - (parseFloat(f.advanceAmount) || 0);
  const showBreakdown = parseFloat(f.advanceAmount) > 0;
  return (
    <div>
      <DocHeader title="Tax Invoice" number={f.docNumber} date={f.docDate}
        freelancer={{ name: f.freelancerName, address: f.freelancerAddress, phone: f.freelancerPhone, email: f.freelancerEmail, pan: f.freelancerPAN }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "4px" }}>
        <div>
          <SectionTitle>Bill To</SectionTitle>
          <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
            <div style={{ fontWeight: "700", fontSize: "13px" }}>{f.clientName || "Client Organisation"}</div>
            {f.contactPerson && <div>Attn: {f.contactPerson}</div>}
            <div style={{ color: "#555", whiteSpace: "pre-line" }}>{f.clientAddress}</div>
          </div>
        </div>
        <div>
          <SectionTitle>Payment Details</SectionTitle>
          <div style={{ fontSize: "11px", lineHeight: "1.9" }}>
            {f.paymentMethod !== "UPI" && (
              <>
                {f.bankName && <TwoCol label="Bank Name" value={f.bankName} />}
                {f.accountNumber && <TwoCol label="Account No." value={f.accountNumber} />}
                {f.ifscCode && <TwoCol label="IFSC Code" value={f.ifscCode} />}
              </>
            )}
            {f.upiId && <TwoCol label="UPI ID" value={f.upiId} />}
            {f.paymentMethod && <TwoCol label="Mode" value={f.paymentMethod} />}
          </div>
        </div>
      </div>

      <SectionTitle>Description of Services</SectionTitle>
      <div style={{ fontSize: "12px", marginBottom: "8px" }}>
        <strong>{f.projectTitle || "Web Development / Design Services"}</strong>
        {f.scopeOfWork && (
          <div style={{ color: "#555", marginTop: "4px" }}>
            <ScopeList scope={f.scopeOfWork} />
          </div>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "8px" }}>
        <thead>
          <tr style={{ background: "#1a1a2e", color: "#fff" }}>
            <th style={{ padding: "8px 12px", textAlign: "left" }}>Description</th>
            <th style={{ padding: "8px 12px", textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {showBreakdown ? (
            <>
              <tr style={{ background: "#f8f8f8" }}>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #e0e0e0" }}>Total Project Cost — {f.projectTitle || "Web Development Services"}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e0e0e0" }}>{formatCurrency(f.totalCost)}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 12px", borderBottom: "1px solid #e0e0e0", color: "#2a7a3b" }}>Less: Advance Received</td>
                <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #e0e0e0", color: "#2a7a3b" }}>({formatCurrency(f.advanceAmount)})</td>
              </tr>
              <tr style={{ background: "#fff9e6" }}>
                <td style={{ padding: "10px 12px", fontWeight: "700", borderBottom: "2px solid #1a1a2e", color: "#c0392b" }}>Balance Due</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", borderBottom: "2px solid #1a1a2e", color: "#c0392b" }}>{formatCurrency(balance)}</td>
              </tr>
            </>
          ) : (
            <tr style={{ background: "#f8f8f8" }}>
              <td style={{ padding: "10px 12px", borderBottom: "2px solid #1a1a2e" }}>{f.projectTitle || "Web Development Services"}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: "2px solid #1a1a2e", fontWeight: "700" }}>{formatCurrency(f.totalCost)}</td>
            </tr>
          )}
          <tr>
            <td style={{ padding: "8px 12px", color: "#888", fontSize: "11px" }}>GST</td>
            <td style={{ padding: "8px 12px", textAlign: "right", color: "#888", fontSize: "11px" }}>NIL</td>
          </tr>
          <tr style={{ background: "#1a1a2e", color: "#fff" }}>
            <td style={{ padding: "10px 12px", fontWeight: "700", fontSize: "13px" }}>
              {showBreakdown ? "Total Amount Due" : "Total Amount"}
            </td>
            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", fontSize: "14px" }}>
              {showBreakdown ? formatCurrency(balance) : formatCurrency(f.totalCost)}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: "11px", color: "#555", marginTop: "6px", fontStyle: "italic" }}>
        Amount in words: <strong>{numberToWords(showBreakdown ? balance : f.totalCost)}</strong>
      </div>

      <div style={{ marginTop: "14px", padding: "10px 14px", background: "#f0f7ff", border: "1px solid #c0d8f0", borderRadius: "4px", fontSize: "10.5px", color: "#1a4a7a", lineHeight: "1.7" }}>
        <strong>Note:</strong> This is a non-GST invoice. Tax will not be charged as annual turnover is below ₹20,00,000 (Twenty Lakh Rupees) as per the provisions of the Central Goods and Services Tax Act, 2017.
        {f.freelancerPAN && <span> (Service Provider PAN: <strong>{f.freelancerPAN}</strong>)</span>}
      </div>

      <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f9faf9", border: "1px solid #d5e8d5", borderRadius: "4px", fontSize: "11px", color: "#2a5a2a" }}>
        🙏 Thank you for your trust and business. We look forward to a continued association. Please make the payment at your earliest convenience.
      </div>

      <SignatureBlock parties={[
        { name: f.freelancerName || "Freelancer Name", role: "Web Developer / Designer" },
        { name: "Received by", role: f.clientName || "Client Organisation" }
      ]} />
    </div>
  );
};

// ── FORM SECTION ────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "7px 10px", border: "1px solid #d0d0d0",
  borderRadius: "5px", fontSize: "12px", color: "#1a1a2e",
  background: "#fff", outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const Input = ({ label, name, value, onChange, type = "text", placeholder, optional }) => (
  <div style={{ marginBottom: "10px" }}>
    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#444", marginBottom: "3px", letterSpacing: "0.3px" }}>
      {label} {optional && <span style={{ color: "#aaa", fontWeight: "400" }}>(optional)</span>}
    </label>
    <input type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} style={inputStyle} />
  </div>
);

const Textarea = ({ label, name, value, onChange, rows = 4, placeholder }) => (
  <div style={{ marginBottom: "10px" }}>
    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#444", marginBottom: "3px" }}>{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={rows}
      placeholder={placeholder}
      style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }} />
  </div>
);

const FieldGroup = ({ title, children }) => (
  <div style={{ marginBottom: "18px" }}>
    <div style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase", color: "#888", marginBottom: "8px", paddingBottom: "4px", borderBottom: "1px solid #eee" }}>{title}</div>
    {children}
  </div>
);

// ── MAIN APP ────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState(initialForm);
  const [activeDoc, setActiveDoc] = useState("quotation");
  const [showForm, setShowForm] = useState(true);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const balance = useMemo(() => {
    const t = parseFloat(form.totalCost) || 0;
    const a = parseFloat(form.advanceAmount) || 0;
    return Math.max(0, t - a);
  }, [form.totalCost, form.advanceAmount]);

  const tabs = [
    { id: "quotation", label: "Quotation", icon: "📋" },
    { id: "workorder", label: "Work Order", icon: "📄" },
    { id: "invoice", label: "Invoice", icon: "🧾" },
  ];

  return (
    <div style={{ fontFamily: "'Garamond', 'Georgia', serif", background: "#f0ede8", minHeight: "100vh" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 20px !important; }
          body { background: white !important; }
        }
        select { font-family: inherit; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; }
        .tab-btn { cursor: pointer; transition: all 0.15s; }
        .tab-btn:hover { opacity: 0.85; }
      `}</style>

      {/* HEADER */}
      <div className="no-print" style={{ background: "#1a1a2e", color: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "-0.3px" }}>📑 Freelance Doc Generator</div>
          <div style={{ fontSize: "11px", color: "#aaa", marginTop: "1px" }}>Quotation · Work Order · Invoice — for Indian Freelancers</div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: "#fff2", border: "1px solid #fff3", color: "#fff", padding: "6px 14px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}>
          {showForm ? "▲ Hide Form" : "▼ Show Form"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "0", maxWidth: "1200px", margin: "0 auto", padding: "20px 16px", boxSizing: "border-box" }}>
        {/* FORM PANEL */}
        {showForm && (
          <div className="no-print" style={{ width: "310px", flexShrink: 0, marginRight: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
              <FieldGroup title="Your Details">
                <Input label="Full Name" name="freelancerName" value={form.freelancerName} onChange={handleChange} placeholder="e.g. Rajesh Kumar" />
                <Textarea label="Address" name="freelancerAddress" value={form.freelancerAddress} onChange={handleChange} rows={2} placeholder="City, State, PIN" />
                <Input label="Phone" name="freelancerPhone" value={form.freelancerPhone} onChange={handleChange} placeholder="+91 98765 43210" />
                <Input label="Email" name="freelancerEmail" value={form.freelancerEmail} onChange={handleChange} placeholder="you@email.com" />
                <Input label="PAN Number" name="freelancerPAN" value={form.freelancerPAN} onChange={handleChange} placeholder="ABCDE1234F" optional />
              </FieldGroup>

              <FieldGroup title="Client Details">
                <Input label="Organisation / School Name" name="clientName" value={form.clientName} onChange={handleChange} placeholder="XYZ Public School" />
                <Textarea label="Address" name="clientAddress" value={form.clientAddress} onChange={handleChange} rows={2} placeholder="City, State, PIN" />
                <Input label="Principal / Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Mr. Sharma" />
              </FieldGroup>

              <FieldGroup title="Project Details">
                <Input label="Project Title" name="projectTitle" value={form.projectTitle} onChange={handleChange} placeholder="Official Website for XYZ School" />
                <Textarea label="Scope of Work (one item per line)" name="scopeOfWork" value={form.scopeOfWork} onChange={handleChange} rows={5}
                  placeholder={"Responsive 5-page website\nAdmin panel / CMS\nContact form with email\nSEO setup\nHosting & domain guidance"} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <Input label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} type="date" />
                  <Input label="Delivery Date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} type="date" />
                </div>
                <Input label="Revision Rounds Included" name="revisionRounds" value={form.revisionRounds} onChange={handleChange} placeholder="2" />
              </FieldGroup>

              <FieldGroup title="Financials">
                <Input label="Total Project Cost (₹)" name="totalCost" value={form.totalCost} onChange={handleChange} type="number" placeholder="50000" />
                <Input label="Advance Amount (₹)" name="advanceAmount" value={form.advanceAmount} onChange={handleChange} type="number" placeholder="25000" />
                <div style={{ background: "#f5f5f5", borderRadius: "5px", padding: "8px 10px", fontSize: "12px", marginBottom: "10px" }}>
                  <span style={{ color: "#666" }}>Balance (auto): </span>
                  <strong style={{ color: "#c0392b" }}>{formatCurrency(balance)}</strong>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#444", marginBottom: "3px" }}>Payment Method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} style={{ ...inputStyle }}>
                    <option>NEFT/RTGS</option>
                    <option>UPI</option>
                    <option>NEFT/RTGS + UPI</option>
                    <option>Cheque</option>
                  </select>
                </div>
              </FieldGroup>

              <FieldGroup title="Bank / UPI Details (for Invoice)">
                <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} placeholder="State Bank of India" optional />
                <Input label="Account Number" name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="123456789012" optional />
                <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="SBIN0001234" optional />
                <Input label="UPI ID" name="upiId" value={form.upiId} onChange={handleChange} placeholder="yourname@upi" optional />
              </FieldGroup>

              <FieldGroup title="Document Info">
                <Input label="Document Number" name="docNumber" value={form.docNumber} onChange={handleChange} placeholder="QUO-001 / WO-001 / INV-001" />
                <Input label="Document Date" name="docDate" value={form.docDate} onChange={handleChange} type="date" />
              </FieldGroup>
            </div>
          </div>
        )}

        {/* DOCUMENT PANEL */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* TABS */}
          <div className="no-print" style={{ display: "flex", gap: "8px", marginBottom: "14px", alignItems: "center", flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t.id} className="tab-btn"
                onClick={() => setActiveDoc(t.id)}
                style={{
                  padding: "8px 18px", borderRadius: "6px", border: "none",
                  background: activeDoc === t.id ? "#1a1a2e" : "#fff",
                  color: activeDoc === t.id ? "#fff" : "#444",
                  fontWeight: "600", fontSize: "12px",
                  boxShadow: activeDoc === t.id ? "0 2px 8px rgba(26,26,46,0.2)" : "0 1px 4px rgba(0,0,0,0.08)",
                  fontFamily: "inherit",
                }}>
                {t.icon} {t.label}
              </button>
            ))}
            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => window.print()}
                style={{
                  padding: "8px 18px", borderRadius: "6px", border: "none",
                  background: "#2a7a3b", color: "#fff", fontWeight: "700",
                  fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(42,122,59,0.25)",
                }}>
                🖨️ Print / Save as PDF
              </button>
            </div>
          </div>

          {/* DOCUMENT */}
          <div className="print-area" style={{
            background: "#fff", borderRadius: "10px", padding: "40px 44px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            minHeight: "842px", // A4-ish
            fontSize: "13px", color: "#1a1a2e", lineHeight: "1.6",
          }}>
            {activeDoc === "quotation" && <QuotationDoc f={form} />}
            {activeDoc === "workorder" && <WorkOrderDoc f={form} />}
            {activeDoc === "invoice" && <InvoiceDoc f={form} />}
          </div>

          <div className="no-print" style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "12px" }}>
            Fill the form on the left · Switch tabs to preview each document · Click Print to save as PDF
          </div>
        </div>
      </div>
    </div>
  );
}
