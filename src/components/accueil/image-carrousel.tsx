import { type Component, createSignal, onMount, Show } from 'solid-js'

interface CarouselProps {
  images: string[]
}

const ImageCarousel: Component<CarouselProps> = (props) => {
  const [open, setOpen] = createSignal(false)
  const [index, setIndex] = createSignal(0)

  onMount(() => {
    document.querySelectorAll('[data-clickable-image]').forEach((img, i) => {
      img.addEventListener('click', () => {
        setIndex(i)
        setOpen(true)
      })
    })
  })

  const next = () => setIndex((i) => (i + 1) % props.images.length)

  const prev = () =>
    setIndex((i) => (i - 1 + props.images.length) % props.images.length)

  const close = () => setOpen(false)

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
            src={props.images[index()]}
            class="w-full h-auto rounded-lg shadow-lg"
          />

          <button
            class="w-[48px] absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 px-3 py-3 rounded-full"
            onClick={prev}
          >
            ‹
          </button>

          <button
            class="w-[48px] absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 px-3 py-3 rounded-full"
            onClick={next}
          >
            ›
          </button>

          <button
            class="absolute top-4 right-4 bg-white px-3 py-1 rounded"
            onClick={close}
          >
            ✕
          </button>
        </div>
      </div>
    </Show>
  )
}

export default ImageCarousel
