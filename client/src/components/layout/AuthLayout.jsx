import { Outlet } from 'react-router-dom'
import Logo from '../common/Logo'

export default function AuthLayout() {
  return (
    <div className="grid min-h-svh bg-canvas lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <Logo />
        <div className="max-w-md">
          <p className="text-sm tracking-[0.22em] text-muted uppercase">Store intelligence</p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-ink">
            Ratings with the quiet confidence of a real product.
          </h1>
          <p className="mt-5 text-sm leading-7 text-muted">
            RATEORA helps teams see how stores are perceived — without the noise of a generic admin panel.
          </p>
        </div>
        <p className="text-xs text-muted">Every rating tells a story.</p>
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="rounded-2xl border border-line bg-card p-6 shadow-soft sm:p-8">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  )
}
