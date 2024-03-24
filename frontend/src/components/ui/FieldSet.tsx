import { ReactNode } from "react"

interface Props {
    children: ReactNode
    header: ReactNode
}

function FieldSet({ children, header }: Props) {
    return (
        <fieldset>
            <legend>{header}</legend>
            {children}
        </fieldset>
    )
}

export default FieldSet