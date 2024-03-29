import type { NextPage } from 'next'
import Head from 'next/head'
import { HomeView } from '../views/Home'

const Home: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>MetaDAO</title>
                <meta name="description" content="MetaDAO" />
            </Head>
            <HomeView />
        </div>
    )
}

export default Home
