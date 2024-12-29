import Cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'

type MiddlewareFunction = (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (result: Error | unknown) => void
) => void

// CORS設定の初期化
const cors = Cors({
    methods: ['GET', 'POST', 'HEAD'],
    origin: ['http://localhost:8081', 'https://english-phrase-prictice-app.vercel.app'],
    credentials: true,
})

// CORSミドルウェアのPromise化
export const runCorsMiddleware = (
    req: NextApiRequest,
    res: NextApiResponse,
    fn: MiddlewareFunction = cors
): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: Error | unknown) => {
            if (result instanceof Error) {
                return reject(result)
            }
            return resolve(result)
        })
    })
}