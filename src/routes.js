import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import OrganizerController from './app/controllers/OrganizerController';
import MeetupController from './app/controllers/MeetupController';

import authMiddleware from './app/middlewares/auth';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.post('/files', upload.single('file'), FileController.store);

routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.get('/meetups', MeetupController.index);
routes.get('/meetups/organizer', OrganizerController.index);
routes.delete('/meetups/:id', MeetupController.delete);

routes.post('/subscribe/:id', SubscriptionController.store);
routes.get('/subscriptions/', SubscriptionController.index);
routes.delete('/subscription/:id', SubscriptionController.delete);

export default routes;
