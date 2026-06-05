import Invoice from '../models/Invoice.js';
import { logAudit } from './auditController.js';

export const getInvoices = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    // Students can only see their own
    if (req.user.role === 'student' && studentId != req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const invoices = await Invoice.getAll({ studentId, status });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    // Students can only see their own
    if (req.user.role === 'student' && invoice.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createInvoice = async (req, res) => {
  if (!['admin', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    // Generate invoice number (e.g., INV-YYYY-XXXX)
    const year = new Date().getFullYear();
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM invoices WHERE YEAR(issue_date) = ?', [year]);
    const seq = (rows[0].count + 1).toString().padStart(4, '0');
    const invoice_number = `INV-${year}-${seq}`;
    req.body.invoice_number = invoice_number;

    const result = await Invoice.create(req.body);
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'invoice',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  if (!['admin', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const { status } = req.body;
    const updated = await Invoice.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ message: 'Invoice not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE_STATUS',
      entity: 'invoice',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Invoice status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteInvoice = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await Invoice.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Invoice not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'invoice',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};