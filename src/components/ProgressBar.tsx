import React from 'react'
import { toCurrency } from 'utils/numberFormat'

const ProgressBar = ({ min, max, value }) => {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div className="relative pt-1">
            <div
                style={{ left: `calc(${percentage}% - 40px)` }}
                className="absolute -mt-7 font-semibold text-white text-base"
            >
                {toCurrency(value, 0)}
            </div>
            <div className="relative overflow-hidden flex h-6 text-base rounded-full bg-secondary">
                <div
                    style={{ width: `${percentage}%` }}
                    className="shadow-none flex flex-col text-center rounded-l-full whitespace-nowrap text-white justify-center gradient"
                >
                    <span className="block absolute right-5 text-gray-600">
                        {toCurrency(max, 0, true)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ProgressBar
