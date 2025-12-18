import { type Component, createSignal, onMount, Show } from 'solid-js'

interface CarouselProps {
  carouselData: string[][]
}

const ImageCarousel: Component<CarouselProps> = (props) => {
  const [open, setOpen] = createSignal(false)
  const [projectIndex, setProjectIndex] = createSignal(0)
  const [imageIndex, setImageIndex] = createSignal(0)
  const [loading, setLoading] = createSignal(true)

  onMount(() => {
    document.querySelectorAll('[data-clickable-image]').forEach((img, i) => {
      img.addEventListener('click', () => {
        setProjectIndex(i)
        setImageIndex(0)
        setLoading(true)
        setOpen(true)
      })
    })
  })

  const currentImages = () => props.carouselData[projectIndex()] || []

  const next = () => {
    setLoading(true)
    setImageIndex((i) => (i + 1) % currentImages().length)
  }

  const prev = () => {
    setLoading(true)
    setImageIndex(
      (i) => (i - 1 + currentImages().length) % currentImages().length
    )
  }

  const close = () => setOpen(false)

  const preloadImagesSequentially = (urls: string[], index: number) => {
    if (index >= urls.length) return

    const img = new Image()
    img.src = urls[index]
    img.onload = () => preloadImagesSequentially(urls, index + 1)
    img.onerror = () => preloadImagesSequentially(urls, index + 1)
  }

  const handleImageLoad = () => {
    setLoading(false)

    if (imageIndex() === 0) {
      preloadImagesSequentially(currentImages(), 1)
    }
  }

  return (
    <Show when={open()}>
      <div
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={close}
      >
        <div
          class="relative max-w-3xl w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Show when={loading()}>
            <div class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          </Show>

          <img
            alt="image"
            src={currentImages()[imageIndex()]}
            class="w-full h-auto rounded-lg shadow-lg"
            classList={{ 'opacity-0': loading() }}
            onLoad={handleImageLoad}
          />

          <button
            class="w-[48px] absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 px-3 py-3 rounded-full hover:bg-white transition-colors"
            onClick={prev}
            aria-label="Image précédente"
            disabled={loading()}
          >
            ‹
          </button>

          <button
            class="w-[48px] absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 px-3 py-3 rounded-full hover:bg-white transition-colors"
            onClick={next}
            aria-label="Image suivante"
            disabled={loading()}
          >
            ›
          </button>

          <button
            class="absolute top-4 right-4 bg-white px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            onClick={close}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>
    </Show>
  )
}

export default ImageCarousel
