import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'module-alias/register';

import { Constants, NodeEnv, Logger } from '@utils';
import { router } from '@router';
import { ErrorHandling } from '@utils/errors';
import { specification } from '@swagger';
import swaggerUi from 'swagger-ui-express';
import { getSocket } from '@utils/socketio';

export const app = express();

// Set up request logger
if (Constants.NODE_ENV === NodeEnv.DEV) {
  app.use(morgan('tiny')); // Log requests only in development environments
}

// Set up request parsers
app.use(express.json()); // Parses application/json payloads request bodies
app.use(express.urlencoded({ extended: false })); // Parse application/x-www-form-urlencoded request bodies
app.use(cookieParser()); // Parse cookies

// Set up CORS
app.use(
  cors({
    origin: Constants.CORS_WHITELIST,
  })
);

app.use('/api', router);

app.use(ErrorHandling);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specification));

export const server = app.listen(Constants.PORT, () => {
  Logger.info(`Server listening on port ${Constants.PORT}`);
})

const io = getSocket(server);

app.set('socketio', io);
