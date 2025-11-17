import Busboy from 'busboy'
import nodemailer from 'nodemailer'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const contentType =
    event.headers['content-type'] || event.headers['Content-Type']

  const busboy = Busboy({
    headers: { 'content-type': contentType },
  })

  const fields = {}
  const files = []

  // Busboy parsing
  return new Promise((resolve, reject) => {
    busboy.on('field', (fieldname, value) => {
      fields[fieldname] = value
    })

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const chunks = []
      file.on('data', (data) => chunks.push(data))
      file.on('end', () => {
        files.push({
          filename,
          mimetype,
          content: Buffer.concat(chunks),
        })
      })
    })

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
Nom : ${fields.name}
Email : ${fields.email}
Message :
${fields.message}
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

    busboy.on('error', reject)

    busboy.end(Buffer.from(event.body, 'base64'))
  })
}
