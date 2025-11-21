import { Request, Response, NextFunction } from 'express';
import Audit from '../models/Audit.model';
import Project from '../models/Project.model';
import ApiResponseUtil from '../utils/response';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { AuditStatus, ProjectStatus, UserRole } from '../types';

export class AuditController {
  // Create new audit record
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId, findings, verifiedCapacity, documents, recommendations } = req.body;

      // Verify project exists
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Verify project is pending audit
      if (project.status !== ProjectStatus.PENDING_AUDIT) {
        throw new BadRequestError('Project is not pending audit');
      }

      // Check if audit already exists for this project
      const existingAudit = await Audit.findOne({
        projectId,
        status: { $in: [AuditStatus.PENDING, AuditStatus.IN_PROGRESS] },
      });

      if (existingAudit) {
        throw new BadRequestError('An active audit already exists for this project');
      }

      // Create audit record
      const audit = await Audit.create({
        projectId,
        auditorId: req.user?._id,
        status: AuditStatus.IN_PROGRESS,
        findings: findings || '',
        verifiedCapacity,
        documents: documents || [],
        recommendations: recommendations || [],
      });

      ApiResponseUtil.created(res, audit, 'Audit created successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get audits for a project
  static async getProjectAudits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;

      // Verify project exists
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Get all audits for this project
      const audits = await Audit.find({ projectId })
        .populate('auditorId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      ApiResponseUtil.success(res, audits);
    } catch (error) {
      next(error);
    }
  }

  // Approve project after audit
  static async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { findings, verifiedCapacity, recommendations, approvalSignature } = req.body;

      const audit = await Audit.findById(id);

      if (!audit) {
        throw new NotFoundError('Audit not found');
      }

      // Check if user is the auditor assigned to this audit or admin
      if (
        audit.auditorId !== req.user?._id &&
        req.user?.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenError('You do not have permission to approve this audit');
      }

      // Verify audit is in progress
      if (audit.status !== AuditStatus.IN_PROGRESS && audit.status !== AuditStatus.PENDING) {
        throw new BadRequestError('Only pending or in-progress audits can be approved');
      }

      // Update audit
      audit.status = AuditStatus.APPROVED;
      if (findings !== undefined) audit.findings = findings;
      if (verifiedCapacity !== undefined) audit.verifiedCapacity = verifiedCapacity;
      if (recommendations !== undefined) audit.recommendations = recommendations;
      if (approvalSignature !== undefined) audit.approvalSignature = approvalSignature;
      audit.completedAt = new Date();

      await audit.save();

      // Update project status and verified capacity
      const project = await Project.findById(audit.projectId);
      
      if (project) {
        project.status = ProjectStatus.APPROVED;
        if (verifiedCapacity !== undefined) {
          project.verifiedCapacity = verifiedCapacity;
        }
        await project.save();
      }

      ApiResponseUtil.success(
        res,
        { audit, project },
        'Project approved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Reject project after audit
  static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { findings, recommendations } = req.body;

      const audit = await Audit.findById(id);

      if (!audit) {
        throw new NotFoundError('Audit not found');
      }

      // Check if user is the auditor assigned to this audit or admin
      if (
        audit.auditorId !== req.user?._id &&
        req.user?.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenError('You do not have permission to reject this audit');
      }

      // Verify audit is in progress
      if (audit.status !== AuditStatus.IN_PROGRESS && audit.status !== AuditStatus.PENDING) {
        throw new BadRequestError('Only pending or in-progress audits can be rejected');
      }

      // Validate findings are provided for rejection
      if (!findings && !audit.findings) {
        throw new BadRequestError('Findings are required when rejecting a project');
      }

      // Update audit
      audit.status = AuditStatus.REJECTED;
      if (findings !== undefined) audit.findings = findings;
      if (recommendations !== undefined) audit.recommendations = recommendations;
      audit.completedAt = new Date();

      await audit.save();

      // Update project status
      const project = await Project.findById(audit.projectId);
      
      if (project) {
        project.status = ProjectStatus.REJECTED;
        await project.save();
      }

      ApiResponseUtil.success(
        res,
        { audit, project },
        'Project rejected'
      );
    } catch (error) {
      next(error);
    }
  }
}

export default AuditController;
