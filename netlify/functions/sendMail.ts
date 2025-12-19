import Busboy from 'busboy'
import nodemailer from 'nodemailer'
import { lookup as mimeLookup } from 'mime-types'
import { createClient } from '@supabase/supabase-js'
import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'

// Client Supabase avec service_role pour bypass RLS
const supabaseAdmin = createClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

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
    address?: string
    zip_code?: string
    city?: string
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
      let orderId: string | null = null
      let uploadedUrls: string[] = []
      const errors: string[] = []

      try {
        // 1) Upload des fichiers vers Supabase Storage
        if (files.length > 0) {
          console.log(`Uploading ${files.length} files to Supabase Storage...`)

          for (const file of files) {
            try {
              // Générer un nom de fichier unique
              const timestamp = Date.now()
              const uniqueFilename = `${timestamp}-${file.filename}`

              // Upload vers le bucket 'orders' (à créer dans Supabase)
              const { data: uploadData, error: uploadError } =
                await supabaseAdmin.storage
                  .from('orders')
                  .upload(uniqueFilename, file.content, {
                    contentType: file.mimetype,
                    upsert: false,
                  })

              if (uploadError) {
                console.error('Upload error:', uploadError)
                errors.push(
                  `Failed to upload ${file.filename}: ${uploadError.message}`
                )
                continue
              }

              // Récupérer l'URL publique
              const { data: urlData } = supabaseAdmin.storage
                .from('orders')
                .getPublicUrl(uniqueFilename)

              uploadedUrls.push(urlData.publicUrl)
              console.log(`Uploaded: ${file.filename} -> ${urlData.publicUrl}`)
            } catch (err) {
              console.error(`Error uploading ${file.filename}:`, err)
              errors.push(`Failed to upload ${file.filename}`)
            }
          }
        }

        // 2) Créer l'order dans la base
        try {
          const { data: orderData, error: orderError } = await supabaseAdmin
            .from('Orders')
            .insert({
              name: fields.name || 'N/A',
              address: fields.address || null,
              zip_code: fields.zip_code || null,
              city: fields.city || null,
              message: fields.message || null,
              attachements: uploadedUrls.length > 0 ? uploadedUrls : null,
              status: 'pending',
            })
            .select()
            .single()

          if (orderError) {
            console.error('Order creation error:', orderError)
            errors.push(`Failed to create order: ${orderError.message}`)
          } else {
            orderId = orderData.id
            console.log('Order created with ID:', orderId)
          }
        } catch (err) {
          console.error('Order creation exception:', err)
          errors.push('Failed to create order in database')
        }

        // 3) Envoi de l'email (même si order a échoué)
        try {
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          })

          const mailOptions = {
            from: process.env.MAIL_USER,
            to: process.env.MAIL_TO,
            subject: `Nouveau devis${orderId ? ` - Order #${orderId.substring(0, 8)}` : ''}`,
            html: `
              <h2>Nouveau devis reçu</h2>
              <p><strong>Nom :</strong> ${fields.name || 'N/A'}</p>
              <p><strong>Email :</strong> ${fields.email || 'N/A'}</p>
              <p><strong>Adresse :</strong> ${fields.address || 'N/A'}</p>
              <p><strong>Code Postal :</strong> ${fields.zip_code || 'N/A'}</p>
              <p><strong>Ville :</strong> ${fields.city || 'N/A'}</p>
              <p><strong>Message :</strong></p>
              <p>${(fields.message || 'N/A').replace(/\n/g, '<br>')}</p>
              ${orderId ? `<p><strong>Order ID :</strong> ${orderId}</p>` : ''}
              ${
                uploadedUrls.length > 0
                  ? `
                <h3>Pièces jointes (${uploadedUrls.length})</h3>
                <ul>
                  ${uploadedUrls.map((url, i) => `<li><a href="${url}">${files[i]?.filename || `Fichier ${i + 1}`}</a></li>`).join('')}
                </ul>
              `
                  : ''
              }
              ${
                errors.length > 0
                  ? `
                <h3 style="color: orange;">⚠️ Avertissements</h3>
                <ul>
                  ${errors.map((err) => `<li>${err}</li>`).join('')}
                </ul>
              `
                  : ''
              }
            `,
            // Attacher les fichiers originaux au mail
            attachments: files.map((f) => ({
              filename: f.filename,
              content: f.content,
              contentType: f.mimetype,
            })),
          }

          await transporter.sendMail(mailOptions)
          console.log('Email sent successfully')
        } catch (emailErr) {
          console.error('Email send error:', emailErr)
          errors.push('Failed to send email')
        }

        // 4) Réponse finale
        resolve({
          statusCode: errors.length > 0 ? 207 : 200, // 207 = Multi-Status (partial success)
          body: JSON.stringify({
            ok: true,
            orderId,
            uploadedFiles: uploadedUrls,
            filesCount: files.length,
            warnings: errors.length > 0 ? errors : undefined,
            message:
              errors.length > 0
                ? 'Devis soumis avec des avertissements'
                : 'Devis soumis avec succès',
          }),
        })
      } catch (err) {
        console.error('Global error:', err)
        resolve({
          statusCode: 500,
          body: JSON.stringify({
            ok: false,
            error: 'Erreur lors du traitement du devis',
            details: err instanceof Error ? err.message : 'Unknown error',
          }),
        })
      }
    })

    busboy.on('error', (err: Error) => {
      console.error('Busboy error:', err)
      reject(err)
    })

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
