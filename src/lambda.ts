import cors from 'cors';
import express from 'express';
import type { APIGatewayProxyEvent, SQSEvent, Context } from 'aws-lambda';
import serverless from 'serverless-http';

type LambdaRequest = SQSEvent | APIGatewayProxyEvent;

const server = function () {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.get('/', (req, res) => {
        res.json({ message: 'Hello World' });
    });

    return serverless(app);
}()

export const handler = async (event: LambdaRequest, context: Context) => {
    console.log("Lambda started");

    if ('httpMethod' in event) {
        return server(event, context);
    }

    return {
        status: 'ok',
        event,
        context,
    };
};