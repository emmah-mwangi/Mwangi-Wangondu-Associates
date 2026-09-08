import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Ensure data directory exists for persistent form storage
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const consultationsFile = path.join(dataDir, 'consultations.json');
const contactsFile = path.join(dataDir, 'contacts.json');

// Initialize data files if they don't exist
if (!fs.existsSync(consultationsFile)) {
  fs.writeFileSync(consultationsFile, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(contactsFile)) {
  fs.writeFileSync(contactsFile, JSON.stringify([], null, 2), 'utf-8');
}

// Helper to safely read and write JSON files
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Specific canonical page routes (case-insensitive & clean aliases)
app.get(['/book-a-consultation', '/bookaconsultation', '/BOOKACONSULTATION', '/consultation'], (req, res) => {
  res.sendFile(path.join(__dirname, 'BOOKACONSULTATION.html'));
});

app.get(['/about', '/about-us', '/aboutthefirm'], (req, res) => {
  res.sendFile(path.join(__dirname, 'aboutthefirm.html'));
});

app.get(['/services', '/our-services'], (req, res) => {
  res.sendFile(path.join(__dirname, 'services.html'));
});

app.get(['/contact', '/contact-us', '/contactpage'], (req, res) => {
  res.sendFile(path.join(__dirname, 'contactpage.html'));
});

// ============================================
// BACKEND FORM RECEIVER API ENDPOINTS
// ============================================

// Consultation Booking Receiver (Replaces the external Google Form)
app.post('/api/consultation', (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      organization,
      sector,
      serviceArea,
      consultationMode,
      preferredDate,
      preferredTimeWindow,
      message
    } = req.body;

    // Strict validation of required fields
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!phone || !phone.trim() || phone.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'A valid telephone number is required.' });
    }
    if (!serviceArea || !serviceArea.trim()) {
      return res.status(400).json({ success: false, error: 'Please select a service area of interest.' });
    }

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `MWA-BK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;

    const newBooking = {
      referenceCode,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      organization: organization ? organization.trim() : 'Not specified',
      sector: sector ? sector.trim() : 'General',
      serviceArea: serviceArea.trim(),
      consultationMode: consultationMode ? consultationMode.trim() : 'In-Person (Vision Plaza, Nairobi)',
      preferredDate: preferredDate ? preferredDate.trim() : 'Flexible / Earliest Available',
      preferredTimeWindow: preferredTimeWindow ? preferredTimeWindow.trim() : 'Business Hours (08:30 - 17:00 EAT)',
      message: message ? message.trim() : '',
      status: 'Received',
      receivedAt: timestamp,
      clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    };

    const bookings = readJSON(consultationsFile);
    bookings.unshift(newBooking);
    writeJSON(consultationsFile, bookings);

    console.log(`[Form Receiver] New Consultation booked: ${referenceCode} by ${newBooking.fullName} (${newBooking.email})`);

    return res.status(201).json({
      success: true,
      message: 'Your consultation request has been successfully received by Mwangi Wangondu & Associates.',
      referenceCode,
      bookingSummary: {
        fullName: newBooking.fullName,
        serviceArea: newBooking.serviceArea,
        consultationMode: newBooking.consultationMode,
        preferredDate: newBooking.preferredDate,
        preferredTimeWindow: newBooking.preferredTimeWindow,
        receivedAt: newBooking.receivedAt
      }
    });
  } catch (err) {
    console.error('Error processing consultation submission:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while registering your consultation. Please contact admin@mwangiandwangonduassociates.com directly.'
    });
  }
});

// General Contact Form Receiver
app.post('/api/contact', (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Message must be at least 5 characters.' });
    }

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `MWA-MSG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;

    const newContact = {
      referenceCode,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : 'Not provided',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      status: 'Received',
      receivedAt: timestamp,
      clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    };

    const contacts = readJSON(contactsFile);
    contacts.unshift(newContact);
    writeJSON(contactsFile, contacts);

    console.log(`[Form Receiver] New Contact Message: ${referenceCode} from ${newContact.fullName}`);

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting Mwangi Wangondu & Associates. We have received your message.',
      referenceCode,
      receivedAt: newContact.receivedAt
    });
  } catch (err) {
    console.error('Error processing contact form submission:', err);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while transmitting your message. Please contact +254 723606653 or admin@mwangiandwangonduassociates.com.'
    });
  }
});

// Health & Submissions count inspection endpoint
app.get('/api/status', (req, res) => {
  const consultations = readJSON(consultationsFile);
  const contacts = readJSON(contactsFile);
  res.json({
    status: 'online',
    firm: 'Mwangi Wangondu & Associates',
    consultationsCount: consultations.length,
    contactsCount: contacts.length,
    lastConsultation: consultations[0] ? {
      reference: consultations[0].referenceCode,
      date: consultations[0].receivedAt
    } : null
  });
});

// Serve static assets and HTML pages
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Route fallback for client navigation to index.html if no file matches
app.get('*', (req, res) => {
  if (!path.extname(req.path)) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  res.status(404).send('Not Found');
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
