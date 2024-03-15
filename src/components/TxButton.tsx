import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TransactionSignature } from '@solana/web3.js'
import { FunctionComponent, useCallback, useState } from 'react'
import { notify } from '../utils/notifications'
import useDysonClientStore from '../stores/useAutocratClient'
import { Button } from './ui/button'
import { set } from 'date-fns'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import useAutocratClientStore from '../stores/useAutocratClient'

interface IProps {
    buttonLabel: string
    handleCall: any
    preCall?: any
    postCall?: any
    errorMessage?: string
    successMessage?: string
    variant?: string
    size?: any
    buttonProps?: any
    className?: string
    disabled?: boolean
}

export const TxButton: FunctionComponent<IProps> = ({
    buttonLabel,
    handleCall,
    preCall,
    postCall,
    errorMessage,
    successMessage,
    disabled,
    ...props
}) => {
    const { client } = useAutocratClientStore()
    const { connection } = useConnection()
    const { publicKey, connected, sendTransaction } = useWallet()
    const [loading, setLoading] = useState(false)
    const { setVisible } = useWalletModal()

    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` })
            console.log('error', `Send Transaction: Wallet not connected!`)
            return
        }

        setLoading(true)
        let signature: TransactionSignature = ''
        try {
            if (preCall) {
                preCall()
            }

            // Get the lates block hash to use on our transaction and confirmation
            let latestBlockhash = await connection.getLatestBlockhash(
                'confirmed'
            )

            // Send transaction and await for signature
            signature = await handleCall()
            console.log('https://solscan.io/tx/' + signature)

            // Await for confirmation
            let confirmation = await connection.confirmTransaction(
                { signature, ...latestBlockhash },
                'confirmed'
            )

            if (confirmation?.value?.err) {
                notify({
                    type: 'error',
                    message: errorMessage || 'Transaction failed!',
                    description: JSON.stringify(confirmation?.value?.err),
                    txid: signature,
                })
                console.log(
                    `Transaction failed! ${JSON.stringify(
                        confirmation?.value?.err
                    )}`
                )
            } else {
                notify({
                    type: 'success',
                    message: successMessage || 'Transaction successful!',
                    txid: signature,
                })
            }

            if (postCall) {
                postCall()
            }
            setLoading(false)
        } catch (error: any) {
            notify({
                type: 'error',
                message: errorMessage || 'Transaction failed!',
                description: error?.message,
                txid: signature,
            })
            console.log(
                'error',
                `Transaction failed! ${error?.message}`,
                signature
            )
            setLoading(false)
            return
        }
    }, [publicKey, notify, connection, sendTransaction])

    return (
        <Button
            variant={props.variant as any}
            loading={loading.toString()}
            onClick={() => {
                if (connected) {
                    return onClick()
                }
                setVisible(true)
            }}
            className={props.className}
            {...props}
            disabled={(!client || disabled) && connected}
        >
            {connected && client ? buttonLabel : 'Connect Wallet'}
        </Button>
    )
}
