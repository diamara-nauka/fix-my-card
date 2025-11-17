import { createSignal } from 'solid-js'

export default function Formulaire() {
  const max = 5
  const [images, setImages] = createSignal([])

  const addImage = (file) => {
    const url = URL.createObjectURL(file)

    setImages((prev) => [...prev, { file, url }])

    const domInputs = document.querySelectorAll(
      '#image-inputs input[type=file]'
    )
    domInputs[images().length].files = createFileList([file])
  }

  const createFileList = (files) => {
    const dt = new DataTransfer()
    files.forEach((f) => dt.items.add(f))
    return dt.files
  }

  const handleSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    addImage(file)
  }

  const removeImage = (i) => {
    // 1) Enlever dans Solid
    setImages((prev) => prev.filter((_, idx) => idx !== i))

    // 2) Vider le bon input caché
    const inputs = document.querySelectorAll('#image-inputs input[type=file]')
    inputs[i].value = ''

    // 3) Re-synchroniser les inputs cachés restants
    const updated = images()
    updated.forEach((img, index) => {
      inputs[index].files = createFileList([img.file])
    })
  }

  let fileInput

  return (
    <div class="mt-6">
      <label class="block mb-2 font-semibold">Images (max 5)</label>

      <div class="flex gap-4">
        {images().map((img, index) => (
          <div class="relative w-24 h-24 border rounded bg-gray-50 overflow-hidden">
            <img src={img.url} class="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              class="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded"
            >
              x
            </button>
          </div>
        ))}

        {images().length < max && (
          <button
            type="button"
            class="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center text-2xl"
            onClick={() => fileInput.click()}
          >
            +
          </button>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        class="hidden"
        onChange={handleSelect}
      />
    </div>
  )
}
