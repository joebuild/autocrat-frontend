// Modal.tsx
import React, { useState, useEffect } from 'react'
import EventEmitter from '../lib/modal/eventEmitter'
import ModalManager from '../lib/modal/modalManager'
import { ModalData } from '../lib/modal/modalTypes'
import { animated, useSpring, useTransition } from '@react-spring/web'


const Modal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [modalData, setModalData] = useState<ModalData | null>(null)

    const backgroundAnimation = useSpring({
        opacity: isOpen ? 1 : 0, // Adjust opacity to your liking
        config: { duration: 125 },
    })

    const contentAnimation = useSpring({
        transform: isOpen ? 'scale(1)' : 'scale(0.9)',
        config: { duration: 125 },
    })

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            ModalManager.closeModal()
        }
    }

    useEffect(() => {
        const openListener = ({ type, data }) => {
            setModalData(data)
            setIsOpen(true)
        }

        const closeListener = () => {
            setIsOpen(false)
            setModalData(null)
        }

        window.addEventListener('keydown', handleKeyDown)

        EventEmitter.on('openModal', openListener)
        EventEmitter.on('closeModal', closeListener)

        return () => {
            EventEmitter.off('openModal', openListener)
            EventEmitter.off('closeModal', closeListener)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    if (!isOpen) return null

    const closeModal = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            ModalManager.closeModal()
        }
    }

    const getModalContent = (type: typeof modalData.type) => {
        switch (type) {
            // case 'initialize':
            //     return (
            //         <InitializeModal
            //             data={modalData as InitializeModalData}
            //             onClose={closeModal}
            //         />
            //     )

            default:
                return null
        }
    }
    return (
        <animated.div
            style={backgroundAnimation}
            className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center w-screen h-screen px-2 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
        >
            <animated.div
                style={contentAnimation}
                className="shadow-2xl bg-background rounded-lg p-6 max-w-[29.25rem]"
            >
                {getModalContent(modalData.type)}
            </animated.div>
        </animated.div>
    )
}

export default Modal
