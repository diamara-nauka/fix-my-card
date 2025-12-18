import {
  type Component,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'

const ImageModal: Component = () => {
  const [open, setOpen] = createSignal(false)
  const [src, setSrc] = createSignal('')

  onMount(() => {
    const handleCardClick = (e: Event) => {
      const card = e.currentTarget as HTMLElement
      const img = card.querySelector<HTMLImageElement>('[data-full-image-src]')
      if (img && img.dataset.fullImageSrc) {
        setSrc(img.dataset.fullImageSrc)
        setOpen(true)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    const cards = document.querySelectorAll<HTMLElement>(
      '[data-slot="card-content"]'
    )
    cards.forEach((card) => {
      card.style.cursor = 'pointer'
      card.addEventListener('click', handleCardClick)
    })

    document.addEventListener('keydown', handleEscape)

    onCleanup(() => {
      cards.forEach((card) =>
        card.removeEventListener('click', handleCardClick)
      )
      document.removeEventListener('keydown', handleEscape)
    })
  })

  const close = () => setOpen(false)

  return (
    <Show when={open()}>
      <div
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center
        justify-center z-50 cursor-pointer"
        onClick={close}
        role="dialog"
        aria-modal="true"
        aria-label="Aperçu de l'image"
      >
        <img
          src={src()}
          alt="Aperçu image"
          class="max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-lg shadow-lg
          cursor-default"
        />
      </div>
    </Show>
  )
}

export default ImageModal
