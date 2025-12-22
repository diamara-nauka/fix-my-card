import Busboy from 'busboy'
import nodemailer from 'nodemailer'
import { lookup as mimeLookup } from 'mime-types'
import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const contentType =
    event.headers['content-type'] || event.headers['Content-Type']

  if (!contentType) {
    return { statusCode: 400, body: 'Content-Type header missing' }
  }

  const busboy = Busboy({
    headers: { 'content-type': contentType },
  })

  const fields: {
    name?: string
    email?: string
    adresse?: string
    codePostal?: string
    ville?: string
    message?: string
    [key: string]: string | undefined
  } = {}
  const files: Array<{
    filename: string
    mimetype: string
    content: Buffer
  }> = []

  return new Promise<HandlerResponse>((resolve, reject) => {
    busboy.on('field', (fieldname: string, value: string) => {
      fields[fieldname] = value
    })

    busboy.on(
      'file',
      (
        fieldname: string,
        file: NodeJS.ReadableStream,
        info: { filename: string; encoding: string; mimeType: string }
      ) => {
        const { filename, mimeType } = info
        const chunks: Buffer[] = []

        file.on('data', (data: Buffer) => chunks.push(data))
        file.on('end', () => {
          const safeFilename = filename || 'unnamed_file'
          const safeMimeType =
            mimeType || mimeLookup(safeFilename) || 'application/octet-stream'

          files.push({
            filename: String(safeFilename),
            mimetype: String(safeMimeType),
            content: Buffer.concat(chunks),
          })
        })
      }
    )

    busboy.on('finish', async () => {
      try {
        // 1) Transport mail (exemple Gmail - tu peux changer)
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        })

        // 2) Contenu du mail
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: process.env.MAIL_TO,
          subject: 'Nouveau devis',
          text: `
Nom : ${fields.name || 'N/A'}
Email : ${fields.email || 'N/A'}
Adresse : ${fields.adresse || 'N/A'}
Code Postal : ${fields.codePostal || 'N/A'}
Ville : ${fields.ville || 'N/A'}
Message :
${fields.message || 'N/A'}
          `,
          attachments: files.map((f) => ({
            filename: f.filename,
            content: f.content,
            contentType: f.mimetype,
          })),
        }

        // 3) Envoi
        await transporter.sendMail(mailOptions)

        resolve({
          statusCode: 200,
          body: JSON.stringify({
            ok: true,
            fields,
            files: files.map((f) => f.filename),
          }),
        })
      } catch (err) {
        console.error(err)
        resolve({
          statusCode: 500,
          body: 'Erreur envoi email',
        })
      }
    })

    busboy.on('error', (err: Error) => reject(err))

    if (!event.body) {
      resolve({
        statusCode: 400,
        body: 'Request body missing',
      })
      return
    }

    busboy.end(Buffer.from(event.body, 'base64'))
  })
}
