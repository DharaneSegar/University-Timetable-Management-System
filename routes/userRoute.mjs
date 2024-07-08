import authenticate from '../config/authenticate.mjs';
import authorize from '../config/authorize.mjs';
import express from "express";
import UserController from '../controllers/userController.mjs';

const UserRouter = express.Router();

UserRouter.post('/',authenticate,authorize('admin'), UserController.createUser);
UserRouter.post('/login', UserController.Login);
UserRouter.get('/',authenticate,authorize('admin' || 'faculty' || 'student'),UserController.getAllUsers);
UserRouter.put('/:id',authenticate,authorize('admin'),UserController.updateUserById);
UserRouter.delete('/:id',authenticate,authorize('admin'),UserController.deleteUserById);
UserRouter.get('/:id',authenticate,authorize('admin' || 'faculty' || 'student'),UserController.getUserbyId);
UserRouter.post('/forgot',authenticate,authorize('admin' || 'faculty' || 'student'),UserController.forgotPassword);
UserRouter.post('/reset/:id',authenticate,authorize('admin' || 'faculty' || 'student'),UserController.resetPassword);

export default UserRouter;