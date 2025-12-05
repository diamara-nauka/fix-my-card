import { type Component, createSignal, onMount, Show } from 'solid-js'

const ImageModal: Component = () => {
  const [open, setOpen] = createSignal(false)
  const [src, setSrc] = createSignal('')

  onMount(() => {
    document
      .querySelectorAll<HTMLImageElement>('[data-clickable-image]')
      .forEach((img) => {
        img.addEventListener('click', () => {
          // Récupère le src de l'image elle-même, pas du data-attribute
          setSrc(img.src)
          setOpen(true)
        })
      })
  })

  const close = () => setOpen(false)

  return (
    <Show when={open()}>
      <div
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 cursor-pointer"
        onClick={close}
      >
        <img
          src={src()}
          alt="Aperçu image"
          class="max-w-3xl max-h-[90vh] rounded-lg shadow-lg cursor-default"
        />
      </div>
    </Show>
  )
}

export default ImageModal
