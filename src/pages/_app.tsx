import Modal from 'components/Modal'
import { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { FC, useEffect, useRef } from 'react'
import { AppBar } from '../components/AppBar'
import { ContentContainer } from '../components/ContentContainer'
import Notifications from '../components/Notification'
import { ContextProvider } from '../contexts/ContextProvider'
import ParticleCanvas from '../lib/particles/Particles'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/router'

require('@solana/wallet-adapter-react-ui/styles.css')
require('../styles/globals.css')

const inter = Inter({ subsets: ['latin'] })

const App: FC<AppProps> = ({ Component, pageProps }) => {
    const router = useRouter()
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo(0, 0)
        }
    }, [router.pathname])
    return (
        <>
            <Head>
                <title>MetaDAO</title>
            </Head>

            <div className={inter.className}>
                <div className="bg-fixed h-screen bg-[url('/images/noise.png')] overflow-x-hidden relative bg-cover">
                    <div className="fixed w-[100vw] pointer-events-none h-screen -top-[60%] blur-3xl">
                        <div className="from-[#ff0004] absolute right-1/2 translate-x-[15%] blur-[50vw] md:blur-[20vw] bottom-0 to-transparent h-[100vh] from-0% to-50%  aspect-square bg-gradient-radial "></div>
                        <div className="from-[#1875f0] absolute right-1/2 translate-x-[80%] blur-[50vw] md:blur-[20vw] bottom-0 to-transparent h-[80vh] from-0% to-50%  aspect-square bg-gradient-radial "></div>
                    </div>
                    <ContextProvider>
                        <div>
                            <ParticleCanvas>
                                <div
                                    ref={scrollContainerRef}
                                    className="h-screen bg-no-repeat bg-cover -z-10"
                                    style={{
                                        overscrollBehaviorY: 'none',
                                        background:
                                            'linear-gradient(0deg, #121823 43.75%, rgba(18, 24, 35, 0.00) 100%)',
                                    }}
                                >
                                    <Notifications />
                                    <AppBar />
                                    <ContentContainer>
                                        <Component {...pageProps} />
                                        <Modal />
                                    </ContentContainer>
                                </div>
                            </ParticleCanvas>
                        </div>
                    </ContextProvider>
                </div>
            </div>
        </>
    )
}

export default App
