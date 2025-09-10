import cors from 'cors';
import express from 'express';
import type { APIGatewayProxyEvent, SQSEvent, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import router from './router';

type LambdaRequest = SQSEvent | APIGatewayProxyEvent;

const httpServer = function () {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/stage', router);

    return serverless(app);
}()

export const handler = async (event: LambdaRequest, context: Context) => {
    console.log("Lambda started");

    if ('httpMethod' in event) {
        return httpServer(event, context);
    }

    return {
        status: 'ok',
        event,
        context,
    };
};