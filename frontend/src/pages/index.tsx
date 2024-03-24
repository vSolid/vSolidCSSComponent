import { fetch } from '@inrupt/solid-client-authn-browser';
import { useEffect, useState } from 'react';
import { getPodUrlAll } from '@inrupt/solid-client';
import { useSessionInfo } from '../hooks/session';
import { useRoot } from '../hooks/root';
import { Link } from 'react-router-dom';
import FieldSet from '../components/ui/FieldSet';

function Home() {
    const sessionInfo = useSessionInfo()
    const [pods, setPods] = useState<string[]>([])

    async function fetchPods() {
        const podUrls = await getPodUrlAll(sessionInfo?.webId ?? "", { fetch: fetch });
        setPods(Array.from(new Set(...pods, podUrls)))
    }

    useEffect(() => {
        fetchPods()
    }, [])

    const webIdRoot = useRoot(sessionInfo?.webId ?? "");

    useEffect(() => {
        if (typeof webIdRoot === "string") {
            setPods(Array.from(new Set([...pods, webIdRoot])))
        }
    }, [webIdRoot])

    return (
        <>
            <FieldSet header={
                <>Pod(s) from <a href={sessionInfo?.webId}>{sessionInfo?.webId}</a> you have access to:</>
            }>
                {pods.map(url => (
                    <li key={url}><Link to={`/explore/?url=${encodeURIComponent(url)}`}>{url}</Link></li>
                ))}
            </FieldSet>
        </>
    )
}

export default Home
