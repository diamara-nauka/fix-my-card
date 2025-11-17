import { createSignal, For } from 'solid-js'

export default function Formulaire() {
  const [files, setFiles] = createSignal([])
  const max = 5

  const addImage = () => {
    if (files().length >= max) return

    const input = document.createElement('input')
    input.type = 'file'
    input.name = `image_${Date.now()}`
    input.accept = 'image/*'
    input.classList.add('hidden')

    input.onchange = () => {
      if (input.files.length === 0) return

      const file = input.files[0]
      const previewUrl = URL.createObjectURL(file)

      setFiles([...files(), { file, url: previewUrl, input }])
    }

    input.click()
  }

  const removeImage = (index) => {
    const arr = [...files()]
    arr[index].input.remove()
    arr.splice(index, 1)
    setFiles(arr)
  }

  return (
    <div>
      <label class="block font-semibold mb-2">Images (max 5)</label>

      <div class="flex flex-wrap gap-4 mb-3">
        <For each={files()}>
          {(item, index) => (
            <div class="relative w-20 h-20 group">
              <img
                src={item.url}
                alt=""
                class="object-cover w-full h-full rounded-md border"
              />

              <button
                type="button"
                class="absolute top-0 right-0 bg-black/60 text-white px-1 text-sm opacity-0 group-hover:opacity-100"
                onClick={() => removeImage(index())}
              >
                ×
              </button>

              {/* input file caché mais indispensable pour Netlify */}
              {item.input}
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
