import Certificate from '../models/Certificate.js';
import { logAudit } from './auditController.js';
import pool from '../config/db.js';

// @desc    Get all certificates (with filters)
// @route   GET /api/certificates
// @access  Admin/Registrar can view all; Students view own
export const getCertificates = async (req, res) => {
  try {
    const { studentId, type } = req.query;

    // Students can only see their own certificates
    if (req.user.role === 'student' && studentId != req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own certificates' });
    }

    const certificates = await Certificate.getAll({ studentId, type });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Admin/Registrar or the student it belongs to
export const getCertificateById = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    // Students can only view their own
    if (req.user.role === 'student' && cert.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own certificates' });
    }

    res.json(cert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Issue a new certificate
// @route   POST /api/certificates
// @access  Admin/Registrar only
export const issueCertificate = async (req, res) => {
  if (!['admin', 'registrar'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Only admin or registrar can issue certificates' });
  }

  const { student_id, certificate_type, issue_date, file_path } = req.body;

  if (!student_id || !certificate_type) {
    return res.status(400).json({ message: 'Student ID and certificate type are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate a unique certificate number (e.g., CERT-YYYY-XXXX)
    const year = new Date().getFullYear();
    const [rows] = await connection.query(
      'SELECT COUNT(*) as count FROM certificates WHERE YEAR(issue_date) = ?',
      [year]
    );
    const seq = (rows[0].count + 1).toString().padStart(4, '0');
    const certificate_number = `CERT-${year}-${seq}`;

    // Create certificate record
    const result = await Certificate.create({
      student_id,
      certificate_type,
      issue_date: issue_date || new Date(),
      certificate_number,
      file_path,
      issued_by: req.user.id
    });

    await connection.commit();

    // Log the action
    await logAudit({
      userId: req.user.id,
      action: 'ISSUE',
      entity: 'certificate',
      entityId: result.id,
      ipAddress: req.ip
    });

    res.status(201).json({
      id: result.id,
      certificate_number,
      message: 'Certificate issued successfully'
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// @desc    Revoke (delete) a certificate
// @route   DELETE /api/certificates/:id
// @access  Admin only (or optionally registrar)
export const revokeCertificate = async (req, res) => {
  if (!['admin', 'registrar'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Only admin or registrar can revoke certificates' });
  }

  try {
    const existing = await Certificate.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Certificate not found' });

    const deleted = await Certificate.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Certificate not found' });

    await logAudit({
      userId: req.user.id,
      action: 'REVOKE',
      entity: 'certificate',
      entityId: req.params.id,
      ipAddress: req.ip
    });

    res.json({ message: 'Certificate revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};