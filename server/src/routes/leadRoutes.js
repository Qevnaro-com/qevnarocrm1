import express from 'express';
import multer from 'multer';
import {
  getLeads,
  createLead,
  updateLeadStatus,
  addLeadNote,
  assignLeads,
  autoDistributeLeads,
  uploadCsvLeads,
  deleteLead,
} from '../controllers/leadController.js';
import { protect, authorize } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.post('/', createLead);
router.patch('/:id/status', updateLeadStatus);
router.patch('/:id/note', addLeadNote);
router.delete('/:id', authorize('Super Admin'), deleteLead);
router.post('/assign', authorize('Super Admin'), assignLeads);
router.post('/auto-distribute', authorize('Super Admin'), autoDistributeLeads);
router.post('/upload-csv', authorize('Super Admin'), upload.single('file'), uploadCsvLeads);

export default router;

