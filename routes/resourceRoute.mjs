import authenticate from '../config/authenticate.mjs';
import authorize from '../config/authorize.mjs';
import express from "express";
import ResourceController from '../controllers/resourceController.mjs';

const ResourceRouter = express.Router();

ResourceRouter.post('/',authenticate,authorize('admin'), ResourceController.createResource);
ResourceRouter.get('/',authenticate,authorize('admin' || 'faculty' || 'student'),ResourceController.getAllResources);
ResourceRouter.put('/:id',authenticate,authorize('admin'),ResourceController.updateResourceById);
ResourceRouter.delete('/:id',authenticate,authorize('admin'),ResourceController.deleteResourceById);
ResourceRouter.get('/:id',authenticate,authorize('admin' || 'faculty' || 'student'),ResourceController.getResourcebyId);

export default ResourceRouter;