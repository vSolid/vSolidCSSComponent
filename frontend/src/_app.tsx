import { useEffect, useState } from 'react';
import { SessionContext, SessionInfo } from './contexts/session'
import { EVENTS, getDefaultSession, handleIncomingRedirect } from '@inrupt/solid-client-authn-browser';
import SigninView from './pages/sign_in';
import { Outlet, useNavigate } from 'react-router-dom';
import { SignoutButton } from './components/buttons/signout_button';

function App() {
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null | undefined>(null);
    const navigate = useNavigate();

    useEffect(() => {
        handleIncomingRedirect({ restorePreviousSession: true })
            .then((info) => {
                if (info && info.isLoggedIn) {
                    setSessionInfo(info as SessionInfo)
                } else {
                    setSessionInfo(undefined)
                }
            })

        const session = getDefaultSession()
        
        session.events.addListener(EVENTS.SESSION_RESTORED, (url: string) => {
            const newURL = new URL(url);
            navigate(newURL.pathname + newURL.search)
        })

        session.events.addListener(EVENTS.LOGOUT, () => setSessionInfo(undefined))
    }, [])

    if (!sessionInfo) return <SigninView />

    return (
        <SessionContext.Provider value={sessionInfo}>
            <Outlet />

            <SignoutButton />
        </SessionContext.Provider>
    )
}

export default App
