import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { VideosController } from './Videos.controller';
import { VideosValidation } from './Videos.validation';
import { fileUploader } from '../../../helpars/fileUploader';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
'/:id',
auth(),
fileUploader.uploadCourseImage,
// validateRequest(VideosValidation.createSchema),
VideosController.createVideos,
);

router.get('/', auth(UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.SUPER_ADMIN), VideosController.getVideosList);

router.get('/:id', auth(UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.SUPER_ADMIN), VideosController.getVideosById);

router.put(
'/:id',
auth(),
fileUploader.uploadCourseImage,
validateRequest(VideosValidation.updateSchema),
VideosController.updateVideos,
);

router.delete('/:id', auth(), VideosController.deleteVideos);

export const VideosRoutes = router;