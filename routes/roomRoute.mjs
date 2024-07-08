import authenticate from '../config/authenticate.mjs';
import authorize from '../config/authorize.mjs';
import express from "express";
import RoomController from '../controllers/roomController.mjs';

const RoomRouter = express.Router();

RoomRouter.post('/', authenticate,authorize('admin'),RoomController.createRoom);
RoomRouter.get('/',authenticate,authorize('admin' || 'faculty' || 'student'),RoomController.getAllRooms);
RoomRouter.put('/:id',authenticate,authorize('admin'),RoomController.updateRoomById);
RoomRouter.delete('/:id',authenticate,authorize('admin'),RoomController.deleteRoomById);
RoomRouter.get('/:id',authenticate,authorize('admin' || 'faculty' || 'student'),RoomController.getRoombyId);

export default RoomRouter;