import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { runCorsMiddleware } from '@/utils/cors'

type NotionProperties = {
    ID: {
        unique_id: {
            prefix: string
            number: number
        }
    }
    Japanese: {
        rich_text: Array<{
            plain_text: string
        }>
    }
    English: {
        title: Array<{
            plain_text: string
        }>
    }
    Date: {
        date: {
            start: string
        } | null
    }
}

type FormattedResponse = {
    id: string
    japanese: string
    english: string
    date: string
}

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // CORSを許可
    await runCorsMiddleware(req, res)

    try {
        // Notion からDBのデータを取得
        const response = await notion.databases.query({
            database_id: databaseId as string,
        })

        const formattedResponse: FormattedResponse[] = (response.results as PageObjectResponse[]).map((result: PageObjectResponse) => {
            const properties = result.properties as unknown as NotionProperties
            return {
                id: properties.ID.unique_id.prefix + '-' + properties.ID.unique_id.number,
                japanese: properties.Japanese.rich_text[0]?.plain_text || '',
                english: properties.English.title[0]?.plain_text || '',
                date: properties.Date.date?.start || '',
            }
        })

        res.status(200).json({ data: formattedResponse })
    } catch (error: Error | unknown) {
        console.error(error)
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' })
    }
}