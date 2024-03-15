interface Props {
    children: React.ReactNode
}

export const ContentContainer: React.FC<Props> = ({ children }) => {
    return <div className="flex flex-col mb-12 md:mb-0 mt-12">{children}</div>
}
