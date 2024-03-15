import BN from 'bn.js'
import Decimal from 'decimal.js'

const SIG_FIGS = 3

const MAX_NUM = 1_000_000_000
const MIN_NUM = 0.001

export const numberFormat = (n: number, sigFigs = SIG_FIGS) => {
    if (n == 0) {
        return n
    } else if (n > MAX_NUM || n < MIN_NUM) {
        return n.toExponential(sigFigs)
    } else {
        return n.toFixed(sigFigs)
    }
}

export const amountToDecimal = (bigNum: BN, decimals: number) => {
    return new Decimal(bigNum.toString()).div(
        new Decimal(10).pow(new Decimal(decimals))
    )
}

export const toCurrency = (
    amount: BN | number | Decimal,
    decimals = 2,
    abbreviate = false
) => {
    let amountNumber: number

    if (BN.isBN(amount)) {
        amountNumber = amount.toNumber()
    } else if (amount instanceof Decimal) {
        amountNumber = amount.toNumber()
    } else {
        amountNumber = amount
    }

    if (abbreviate && amountNumber >= 1000) {
        const units = ['k', 'M', 'B', 'T']
        const order = Math.floor(Math.log10(Math.abs(amountNumber)) / 3)
        const number = Number(amountNumber / Math.pow(1000, order))
        return `$${number}${units[order - 1]}`
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: decimals,
    }).format(amountNumber)
}

export const toFormattedNumber = (amount: number | undefined, decimals = 2) => {
    if (amount === undefined) {
        console.error('amount is undefined')
        return ''
    }
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: decimals,
    }).format(Number(amount))
}
