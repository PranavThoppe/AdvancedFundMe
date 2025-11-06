import '@/app/global.css'
import Providers from './providers'

export const metadata = {
  title: 'Fund Me',
  description: 'Donate ETH on Sepolia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
