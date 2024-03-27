import { ReactNode } from "react"

interface Props {
    children: ReactNode
    header: ReactNode
    className?: string
}

function FieldSet({ children, header, className }: Props) {
    return (
        <fieldset className={className ?? ""}>
            <legend>{header}</legend>
            {children}
        </fieldset>
    )
}

export default FieldSet