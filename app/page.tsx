import { redirect } from 'next/navigation'

/**
 * Pagina principal que redirige a la version HTML estatica
 * La tienda SoundSpin Records esta construida con HTML, CSS y JavaScript puro
 */
export default function Page() {
  redirect('/index.html')
}
