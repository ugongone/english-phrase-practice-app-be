import { runCorsMiddleware } from "@/utils/cors";
import { Client } from "@notionhq/client";
import { NextApiResponse } from "next";
import { NextApiRequest } from "next";

const client = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * データを更新するAPI
 * @param req リクエスト
 * @param req.body.id 更新するデータのID
 * @param req.body.status 更新するデータのステータス
 * @param res レスポンス
 * @returns 更新したデータ
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORSを許可
  await runCorsMiddleware(req, res);

  const { id, status } = req.body;
  const page = await client.pages.update({
    page_id: id,
    properties: {
      Status: { select: { name: status } },
    },
  });

  res.status(200).json({ data: page });
}
