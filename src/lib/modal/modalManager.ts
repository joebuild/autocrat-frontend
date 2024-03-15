import EventEmitter from './eventEmitter'
import { ModalData } from './modalTypes'

class ModalManager {
    private modalData: ModalData | null = null

    openModal(data: ModalData) {
        this.modalData = data
        EventEmitter.emit('openModal', { data })
    }

    closeModal() {
        this.modalData = null
        EventEmitter.emit('closeModal')
    }

    getModalData(): ModalData | null {
        return this.modalData
    }
}

export default new ModalManager()
