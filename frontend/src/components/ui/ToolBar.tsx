import { ArrowLeftIcon, ArrowUpIcon } from "@heroicons/react/16/solid";
import { isContainer, isRawData } from "@inrupt/solid-client";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResource } from "../../contexts/resource";
import { useRoot } from "../../hooks/root";

export default function Toolbar() {
    const { resource, url } = useResource()
    const navigate = useNavigate()
    const root = useRoot(url ?? "")
    const [localUrl, setLocalUrl] = useState<string | null>(url);

    useEffect(() => setLocalUrl(url), [url]);

    function handleBack() {
        navigate(-1)
    }

    function handleUp() {
        if (!url) return;
        if (url === root) {
            navigate('/')
            return
        }
        const withoutTrailingSlash = url.endsWith('/') ? url.substring(0, url.length - 2) : url
        const newUrl = withoutTrailingSlash.substring(0, withoutTrailingSlash.lastIndexOf('/')) + '/';
        navigate(`/explore/?url=${encodeURIComponent(newUrl)}`)
    }

    function getResourceType() : string | null {
        if (!resource) return null;
        if (isRawData(resource)) {
            return "FILE";
        } else {
            return isContainer(resource) ? "CONTAINER" : "THING";
        }
    }

    function getResourceTypeCaption() {
        const type = getResourceType()
        return type ? `${type}: ${url}` : ""
    }

    function handleUrlInput(event: ChangeEvent<HTMLInputElement>) {
        setLocalUrl(event.currentTarget.textContent)
    }

    function handleEnter(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault()
            localUrl && navigate(`/explore/?url=${encodeURIComponent(localUrl)}`)
        }
    }

    return (
        <div className="flex gap-2 items-center">
            <span className="cursor-pointer" onClick={handleBack}><ArrowLeftIcon className="w-5 h-5"/></span>
            <span className="cursor-pointer" onClick={handleUp}><ArrowUpIcon className="w-5 h-5"/></span>
            <h3>
                {getResourceType()}: 
                &nbsp;
                <span contentEditable onInput={handleUrlInput} onKeyDown={handleEnter}>
                    {url}
                </span>
            </h3>
        </div>
    )
}