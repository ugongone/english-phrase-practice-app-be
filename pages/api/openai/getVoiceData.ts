import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai';
import { runCorsMiddleware } from '@/utils/cors'

// https://platform.openai.com/docs/api-reference/audio/createSpeech
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // CORSを許可
    await runCorsMiddleware(req, res)

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await openai.audio.speech.create({
            model: 'tts-1-hd', // 'tts-1' or 'tts-1-hd'
            voice: 'alloy', // alloy, echo, fable, onyx, nova, shimmer
            input: text,
        });

        // 音声データをBase64エンコードして返却
        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');

        res.status(200).json({ audio: `data:audio/mp3;base64,${audioBase64}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
}