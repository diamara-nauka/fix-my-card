import { createSignal, onMount } from 'solid-js'

export default function ImageModal() {
  const [open, setOpen] = createSignal(false)
  const [src, setSrc] = createSignal('')

  onMount(() => {
    document.querySelectorAll('[data-image]').forEach((img) => {
      img.addEventListener('click', () => {
        setSrc(img.dataset.image)
        setOpen(true)
      })
    })
  })

  const close = () => setOpen(false)

  return (
    <>
      {open() && (
        <div
          class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={close}
        >
          <img
            src={src()}
            alt="Aperçu image"
            class="max-w-3xl max-h-[90vh] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
