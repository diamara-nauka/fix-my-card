/**
 * Redimensionne et compresse une image côté client.
 * @param file Le fichier image original.
 * @param maxDimension La dimension maximale (largeur ou hauteur) en pixels.
 * @param quality La qualité de la compression JPEG (0 à 1).
 * @returns Une promesse qui résout vers un nouveau fichier image redimensionné.
 */
export const resizeImage = (
  file: File,
  maxDimension: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Vérification basique du type de fichier
    if (!file.type.match(/image.*/)) {
      reject(new Error('Le fichier doit être une image.'))
      return
    }

    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      const image = new Image()
      image.onload = () => {
        let width = image.width
        let height = image.height

        // Calcul des nouvelles dimensions en conservant le ratio
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error("Impossible d'obtenir le contexte du canvas."))
          return
        }

        // Fond blanc pour gérer la transparence (les PNG deviendraient noirs en JPEG sinon)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)

        ctx.drawImage(image, 0, 0, width, height)

        // Conversion du canvas en blob/fichier
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la création du blob.'))
              return
            }

            // Création d'un nouveau fichier avec le même nom (ou modifié)
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })

            console.log(
              `Image redimensionnée: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(resizedFile.size / 1024 / 1024).toFixed(2)}MB)`
            )

            resolve(resizedFile)
          },
          'image/jpeg',
          quality
        )
      }
      image.onerror = (err) => reject(err)
      image.src = readerEvent.target?.result as string
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
