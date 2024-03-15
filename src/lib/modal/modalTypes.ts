export interface BaseModalData {
    type: string
}

interface InfoModalData extends BaseModalData {
    type: 'info'
    message: string
}

interface ErrorModalData extends BaseModalData {
    type: 'error'
    // errorCode: number
    // errorMessage: string
}

export type ModalData =
    | InfoModalData
    | ErrorModalData
