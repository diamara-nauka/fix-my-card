import { createSignal, onMount, Show } from 'solid-js'

export default function FormSubmitHandler() {
  const [isLoading, setIsLoading] = createSignal(false)
  const [showErrorModal, setShowErrorModal] = createSignal(false)

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

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.body || 'Erreur serveur')
          }

          const data = await res.json()
          console.log('Serveur :', data)

          // Redirection vers la page de remerciement
          window.location.href = '/merci'
        } catch (error) {
          console.error('Erreur:', error)
          setIsLoading(false)

          // Afficher la modale d'erreur
          setShowErrorModal(true)
        }
      })
    }
  })

  return (
    <>
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

      {/* Modale d'erreur */}
      <Show when={showErrorModal()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowErrorModal(false)}
        >
          <div
            class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec icône */}
            <div class="flex items-center gap-3 mb-4">
              <div class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">
                Impossible d'envoyer votre demande
              </h3>
            </div>

            {/* Contenu */}
            <div class="space-y-4 mb-6">
              <div>
                <h4 class="font-semibold text-gray-800 mb-2">
                  Causes possibles :
                </h4>
                <ul class="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>Les images sont encore trop volumineuses</li>
                  <li>Problème de connexion internet</li>
                </ul>
              </div>

              <div>
                <h4 class="font-semibold text-gray-800 mb-2">Solutions :</h4>
                <ul class="list-disc list-inside text-gray-600 space-y-1 ml-2">
                  <li>Réessayez avec des images de taille réduite</li>
                  <li>Vérifiez votre connexion</li>
                  <li>
                    Contactez-nous directement par email si le problème persiste
                  </li>
                </ul>
              </div>
            </div>

            {/* Bouton de fermeture */}
            <button
              onClick={() => setShowErrorModal(false)}
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-md transition-colors"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </Show>
    </>
  )
}
