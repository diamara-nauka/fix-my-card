import { createSignal, onMount } from 'solid-js'

export default function FormSubmitHandler() {
  const [isLoading, setIsLoading] = createSignal(false)

  onMount(() => {
    const form = document.getElementById('devis-form') as HTMLFormElement
    const submitButton = form?.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement

    if (form && submitButton) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
          const formData = new FormData(e.target as HTMLFormElement)

          const res = await fetch('/.netlify/functions/sendMail', {
            method: 'POST',
            body: formData,
          })

          const data = await res.json()
          console.log('Serveur :', data)

          // Redirection vers la page de remerciement
          window.location.href = '/merci'
        } catch (error) {
          console.error('Erreur:', error)
          setIsLoading(false)
          alert('Une erreur est survenue. Veuillez réessayer.')
        }
      })
    }
  })

  return (
    <button
      type="submit"
      disabled={isLoading()}
      class="mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
    >
      {isLoading() ? (
        <>
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Envoi en cours...
        </>
      ) : (
        'Envoyer'
      )}
    </button>
  )
}
