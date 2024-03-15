import type { NextPage } from 'next'
import Head from 'next/head'
import { AdminView } from '../views/Admin'

const Home: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>MetaDAO</title>
                <meta name="description" content="MetaDAO" />
            </Head>
            <AdminView />
        </div>
    )
}

export default Home
