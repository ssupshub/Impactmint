import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project.model';
import ApiResponseUtil from '../utils/response';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { ProjectStatus, UserRole } from '../types';

export class ProjectController {
  // Create new project
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        description,
        location,
        capacity,
        methodology,
        startDate,
        endDate,
        documents,
        images,
        metadata,
      } = req.body;

      const project = await Project.create({
        name,
        description,
        owner: req.user?._id,
        location,
        capacity,
        methodology,
        startDate,
        endDate,
        documents,
        images,
        metadata,
        status: ProjectStatus.DRAFT,
      });

      ApiResponseUtil.created(res, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  // List projects with filters and pagination
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = (req.query.sort as string) || 'createdAt';
      const order = (req.query.order as string) === 'asc' ? 1 : -1;
      const status = req.query.status as string;
      const country = req.query.country as string;
      const methodology = req.query.methodology as string;
      const owner = req.query.owner as string;
      const search = req.query.search as string;

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      // Only show active/approved projects to non-owners unless authenticated
      if (req.user) {
        // Authenticated users can see their own projects regardless of status
        if (req.user.role !== UserRole.ADMIN && owner !== req.user._id) {
          filter.$or = [
            { status: { $in: [ProjectStatus.ACTIVE, ProjectStatus.APPROVED, ProjectStatus.COMPLETED] } },
            { owner: req.user._id },
          ];
        }
      } else {
        // Public users only see active/approved/completed projects
        filter.status = { $in: [ProjectStatus.ACTIVE, ProjectStatus.APPROVED, ProjectStatus.COMPLETED] };
      }

      if (status && req.user) {
        filter.status = status;
      }
      if (country) filter['location.country'] = country;
      if (methodology) filter.methodology = methodology;
      if (owner) filter.owner = owner;
      if (search) {
        filter.$text = { $search: search };
      }

      // Get projects with pagination
      const [projects, total] = await Promise.all([
        Project.find(filter)
          .populate('owner', 'firstName lastName email')
          .sort({ [sort]: order })
          .skip(skip)
          .limit(limit),
        Project.countDocuments(filter),
      ]);

      ApiResponseUtil.success(res, {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get project by ID
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findById(id).populate('owner', 'firstName lastName email hederaAccountId');

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Check if user has permission to view draft projects
      if (
        project.status === ProjectStatus.DRAFT &&
        (!req.user || (req.user._id !== project.owner && req.user.role !== UserRole.ADMIN))
      ) {
        throw new ForbiddenError('You do not have permission to view this project');
      }

      ApiResponseUtil.success(res, project);
    } catch (error) {
      next(error);
    }
  }

  // Update project
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        location,
        capacity,
        methodology,
        startDate,
        endDate,
        documents,
        images,
        metadata,
        status,
      } = req.body;

      const project = await Project.findById(id);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Check ownership
      if (project.owner !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
        throw new ForbiddenError('You do not have permission to update this project');
      }

      // Update fields
      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;
      if (location !== undefined) project.location = location;
      if (capacity !== undefined) project.capacity = capacity;
      if (methodology !== undefined) project.methodology = methodology;
      if (startDate !== undefined) project.startDate = startDate;
      if (endDate !== undefined) project.endDate = endDate;
      if (documents !== undefined) project.documents = documents;
      if (images !== undefined) project.images = images;
      if (metadata !== undefined) project.metadata = metadata;
      
      // Only admin can change status directly (except through submit-for-audit)
      if (status !== undefined && req.user?.role === UserRole.ADMIN) {
        project.status = status;
      }

      await project.save();

      ApiResponseUtil.success(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Delete project
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Check ownership
      if (project.owner !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
        throw new ForbiddenError('You do not have permission to delete this project');
      }

      // Only allow deletion of draft projects
      if (project.status !== ProjectStatus.DRAFT) {
        throw new BadRequestError('Only draft projects can be deleted');
      }

      await project.deleteOne();

      ApiResponseUtil.success(res, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Submit project for audit
  static async submitForAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Check ownership
      if (project.owner !== req.user?._id && req.user?.role !== UserRole.ADMIN) {
        throw new ForbiddenError('You do not have permission to submit this project');
      }

      // Validate project is in draft status
      if (project.status !== ProjectStatus.DRAFT) {
        throw new BadRequestError('Only draft projects can be submitted for audit');
      }

      // Validate required fields are complete
      if (!project.name || !project.description || !project.capacity || !project.methodology) {
        throw new BadRequestError('Project is incomplete. Please fill in all required fields');
      }

      project.status = ProjectStatus.PENDING_AUDIT;
      await project.save();

      ApiResponseUtil.success(res, project, 'Project submitted for audit successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectController;
