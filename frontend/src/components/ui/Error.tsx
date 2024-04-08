import { useResource } from "../../contexts/resource"

function NotFound() {
    const { url, error } = useResource()

    function getErrorTitle() {
        switch (error?.code) {
            case 403:
                return "403 - Forbidden"
            case 404:
                return "404 - Not Found"
            default:
                return error?.code ?? ""
        }
    }

    return (
        <div>
            <h2>{getErrorTitle()}</h2>
            <p>The resource could not be accessed at the following URL: {url}</p>
        </div>
    )
}

export default NotFound