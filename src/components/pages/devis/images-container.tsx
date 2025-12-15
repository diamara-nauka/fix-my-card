import { createSignal, For } from 'solid-js'

interface FileItem {
  file: File
  url: string
}

export default function Formulaire() {
  const [files, setFiles] = createSignal<FileItem[]>([])
  const max = 5

  const addImage = () => {
    if (files().length >= max) return

    // input "temporaire" hors JSX
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = () => {
      if (!input.files || input.files.length === 0) return // annulation = rien

      const file = input.files[0]
      const url = URL.createObjectURL(file)

      // on ajoute seulement APRES sélection
      setFiles([...files(), { file, url }])
    }

    input.click()
  }

  const removeImage = (index: number) => {
    const list = [...files()]
    list.splice(index, 1)
    setFiles(list)
  }

  return (
    <div class="mt-4">
      <label class="block font-semibold mb-2">Images (max 5)</label>

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
                class="absolute top-0 right-0 bg-black/60 text-white px-1 text-sm opacity-0 group-hover:opacity-100"
                onClick={() => removeImage(index())}
              >
                ×
              </button>
            </div>
          )}
        </For>

        {files().length < max && (
          <button
            type="button"
            onClick={addImage}
            class="w-20 h-20 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center text-3xl hover:bg-gray-100"
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}
