import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  GitBranch, 
  Cpu,
  Sparkles
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'How does code splitting improve web performance?',
      a: 'Instead of forcing the client browser to download and parse the entire single JavaScript bundle upfront (which blocks First Contentful Paint), code splitting separates non-critical routes and heavy dependencies into on-demand chunks loaded only when visited.'
    },
    {
      q: 'Why wrap lazy components in React Suspense?',
      a: 'Because dynamic imports return a JavaScript Promise, React requires a <Suspense> boundary with a fallback UI to render structural placeholders while the asynchronous network request resolves.'
    },
    {
      q: 'What is the purpose of minimum-delay fallback?',
      a: 'On fast network connections (e.g. 5G or local fiber), lazy chunks load in 10-30ms. Without a minimum delay buffer, the fallback spinner flashes violently, creating an annoying visual stutter. A 300ms floor ensures silky smooth transitions.'
    }
  ];

  return (
    <div className="contact-page-container" style={{ padding: '2rem 1.5rem', maxWidth: '1180px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: '#e0e7ff', borderRadius: '999px', color: '#4f46e5', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.8rem' }}>
          <Sparkles size={14} />
          <span>Lazy Route Chunk • Code-Split On Demand</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem' }}>
          Support & Engineering Feedback
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '640px', margin: '0 auto' }}>
          Have technical inquiries regarding code splitting, SWR caching, or full-stack API integration? Reach out below.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Contact Form Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageSquare size={20} color="#4f46e5" />
            <span>Send Direct Message</span>
          </h2>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 0.5rem' }}>Message Transmitted!</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
                Thank you for your feedback. Our team has received your submission.
              </p>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@institution.edu"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Inquiry Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. React.lazy() & Vite Chunks"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry, performance observation, or bug report..."
                  className="form-input"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.2rem', marginTop: '0.5rem' }}>
                <Send size={15} />
                <span>Submit Transmission</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info & System Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem' }}>
              Academic & Engineering Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', color: '#4f46e5' }}>
                  <Mail size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>Direct Email</div>
                  <div style={{ fontSize: '0.82rem' }}>adwf.practical.review@university.edu</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', color: '#10b981' }}>
                  <Cpu size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>Lab Practical</div>
                  <div style={{ fontSize: '0.82rem' }}>PR8 — Code Splitting & Performance Profiling</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', color: '#0ea5e9' }}>
                  <GitBranch size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>Source Repository</div>
                  <div style={{ fontSize: '0.82rem' }}>AnmolDholiya/API-Testing</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="#4f46e5" />
              <span>Core Concepts FAQ</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    background: activeFaq === idx ? '#f8fafc' : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#0f172a' }}>
                    <span>{faq.q}</span>
                    <span style={{ color: '#64748b', fontSize: '1rem' }}>{activeFaq === idx ? '−' : '+'}</span>
                  </div>
                  {activeFaq === idx && (
                    <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
