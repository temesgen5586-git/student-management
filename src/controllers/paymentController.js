import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { logAudit } from './auditController.js';
import pool from '../config/db.js'; // needed for transaction

export const getPayments = async (req, res) => {
  try {
    const { invoiceId, studentId } = req.query;
    // Students can only see payments on their own invoices
    if (req.user.role === 'student') {
      const payments = await Payment.getAll({ studentId: req.user.id });
      return res.json(payments);
    }
    const payments = await Payment.getAll({ invoiceId, studentId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    // Students can only see their own
    if (req.user.role === 'student') {
      const invoice = await Invoice.findById(payment.invoice_id);
      if (!invoice || invoice.student_id !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const recordPayment = async (req, res) => {
  if (!['admin', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { invoice_id, amount, payment_method, reference } = req.body;
    // First update invoice paid amount (using model method that handles transaction)
    await Invoice.addPayment(invoice_id, amount, {
      payment_method,
      reference,
      received_by: req.user.id
    }, connection);
    // Then create payment record
    const result = await Payment.create({
      invoice_id,
      amount,
      payment_method,
      reference,
      received_by: req.user.id
    });
    await connection.commit();
    await logAudit({
      userId: req.user.id,
      action: 'RECORD_PAYMENT',
      entity: 'payment',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

export const deletePayment = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await Payment.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'payment',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};