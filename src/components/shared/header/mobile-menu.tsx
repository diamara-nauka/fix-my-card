import { type Component, createSignal, Show } from 'solid-js'

interface NavItem {
  id: string
  label: string
  href: string
}

const MobileMenu: Component<{
  navItems: NavItem[]
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen())
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button onClick={toggleMenu} class="md:hidden" aria-label="Toggle menu">
        <Show when={!isOpen()}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none">
            <path
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Show>
        <Show when={isOpen()}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none">
            <path
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              d="M6 6l12 12M6 18L18 6"
            />
          </svg>
        </Show>
      </button>

      <Show when={isOpen()}>
        <div class="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg pb-4 space-y-2">
          {props.navItems.map((item) => (
            <a
              href={item.href}
              onClick={closeMenu}
              class="block w-full text-left px-4 py-2 transition-colors text-gray-700 hover:bg-gray-50"
            >
              {item.label}
            </a>
          ))}
        </div>
      </Show>
    </>
  )
}

export default MobileMenu
