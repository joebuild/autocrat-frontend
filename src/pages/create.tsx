import type { NextPage } from 'next'
import Head from 'next/head'
import { CreateView } from '../views/Create'

const Home: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>MetaDAO</title>
                <meta name="description" content="MetaDAO" />
            </Head>
            <CreateView />
        </div>
    )
}

export default Home
