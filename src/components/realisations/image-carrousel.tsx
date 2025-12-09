import { type Component, createSignal, onMount, Show } from 'solid-js'

interface CarouselProps {
  carouselData: string[][]
}

const ImageCarousel: Component<CarouselProps> = (props) => {
  const [open, setOpen] = createSignal(false)
  const [projectIndex, setProjectIndex] = createSignal(0)
  const [imageIndex, setImageIndex] = createSignal(0)

  onMount(() => {
    document.querySelectorAll('[data-clickable-image]').forEach((img, i) => {
      img.addEventListener('click', () => {
        setProjectIndex(i)
        setImageIndex(0)
        setOpen(true)
      })
    })
  })

  const currentImages = () => props.carouselData[projectIndex()] || []

  const next = () => setImageIndex((i) => (i + 1) % currentImages().length)

  const prev = () =>
    setImageIndex(
      (i) => (i - 1 + currentImages().length) % currentImages().length
    )

  const close = () => setOpen(false)

  /*
   * Preload images sequentially (one by one) to avoid flooding the network
   * and letting the browser cache handle the storage.
   */
  const preloadImagesSequentially = (urls: string[], index: number) => {
    if (index >= urls.length) return

    const img = new Image()
    img.src = urls[index]
    img.onload = () => preloadImagesSequentially(urls, index + 1)
    img.onerror = () => preloadImagesSequentially(urls, index + 1)
  }

  const handleImageLoad = () => {
    // Start preloading the rest only if we just loaded the first image (index 0)
    if (imageIndex() === 0) {
      // Start from index 1 (since 0 is already loaded/displaying)
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
          <img
            alt="image"
            src={currentImages()[imageIndex()]}
            class="w-full h-auto rounded-lg shadow-lg"
            onLoad={handleImageLoad}
          />

          <button
            class="w-[48px] absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 px-3 py-3 rounded-full hover:bg-white transition-colors"
            onClick={prev}
            aria-label="Image précédente"
          >
            ‹
          </button>

          <button
            class="w-[48px] absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 px-3 py-3 rounded-full hover:bg-white transition-colors"
            onClick={next}
            aria-label="Image suivante"
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
