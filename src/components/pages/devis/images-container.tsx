import { createSignal, For, createEffect } from 'solid-js'
import { resizeImage } from '../../../utils/image-resizer'

interface FileItem {
  file: File
  url: string
}

export default function Formulaire() {
  const [files, setFiles] = createSignal<FileItem[]>([])
  const max = 5
  let hiddenInput: HTMLInputElement | undefined

  // Mettre à jour la validité du champ quand les fichiers changent
  createEffect(() => {
    if (hiddenInput) {
      if (files().length > 0) {
        hiddenInput.value = 'valid'
        hiddenInput.setCustomValidity('')
      } else {
        hiddenInput.value = ''
        hiddenInput.setCustomValidity('Au moins une image est requise')
      }
    }
  })

  const addImage = () => {
    if (files().length >= max) return

    // input "temporaire" hors JSX
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return // annulation = rien

      const originalFile = input.files[0]

      try {
        const resizedFile = await resizeImage(originalFile)
        const url = URL.createObjectURL(resizedFile)

        // on ajoute seulement APRES sélection et redimensionnement
        setFiles([...files(), { file: resizedFile, url }])
      } catch (error) {
        console.error("Erreur lors du redimensionnement de l'image", error)
        // Fallback or alert user? For now, silence or alert could be good.
        // Given the quick fix nature, maybe just alert if critical, but let's stick to console for now
        // or just add original if resize fails? No, better to fail resize than send huge file.
        alert('Impossible de traiter cette image. Veuillez réessayer.')
      }
    }

    /* disable image compression
    input.onchange = () => {
      if (!input.files || input.files.length === 0) return // annulation = rien

      const file = input.files[0]
      const url = URL.createObjectURL(file)

      // on ajoute seulement APRES sélection
      setFiles([...files(), { file, url }])
    }
     */

    input.click()
  }

  const removeImage = (index: number) => {
    const list = [...files()]
    list.splice(index, 1)
    setFiles(list)
  }

  return (
    <div class="mt-4">
      <label class="block font-semibold mb-2">
        Images (max 5) <span class="text-red-500">*</span>
      </label>

      <div class="flex flex-wrap gap-4">
        <For each={files()}>
          {(item, index) => (
            <div class="relative w-20 h-20 group">
              {/* Miniature */}
              <img
                src={item.url}
                alt={`Image ${index() + 1}`}
                class="object-cover w-full h-full rounded-md border"
              />
              <input
                type="file"
                name={`image_${index()}`}
                class="hidden"
                value=""
                // fichier injecté dans l'input pour Netlify
                ref={(el: HTMLInputElement) => {
                  // On recrée un fichier dans cet input (obligatoire pour Netlify)
                  const dt = new DataTransfer()
                  dt.items.add(item.file)
                  el.files = dt.files
                }}
              />

              {/* Supprimer */}
              <button
                type="button"
                class="absolute w-5 h-5 top-0 right-0 bg-black/60 text-white px-1 text-sm opacity-100"
                onClick={() => removeImage(index())}
              >
                ×
              </button>
            </div>
          )}
        </For>

        {files().length < max && (
          <div class="relative w-20 h-20">
            {/* Champ caché pour la validation HTML5 */}
            <input
              ref={hiddenInput}
              type="text"
              id="images-required"
              name="images-required"
              required
              class="absolute inset-0 opacity-0 pointer-events-none"
              tabindex="-1"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={addImage}
              class="w-20 h-20 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center text-3xl hover:bg-gray-100"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
