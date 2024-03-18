import { FC } from 'react'

interface IState {

}

export const HomeView: FC = ({ }) => {

    return (
        <div className="w-screen min-h-full px-2 pb-10 overflow-x-hidden">
            <h1 className="mb-6 font-black text-center">MetaDAO</h1>

            <div className="flex mt-20 place-content-center">
                <div className="carousel carousel-center rounded-box">
                    <div className="w-100 carousel-item">
                        <img src="/images/page10.png" className="w-80" alt="page10" />
                    </div>

                    {/* <div className="carousel-item">
                        <img src="/images/page10.png" className="w-80" alt="page10" />
                    </div> */}

                </div>
            </div>
        </div>
    )
}
