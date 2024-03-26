import { EVENTS, ISessionInfo, getDefaultSession, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SigninView from "../pages/sign_in";

export type SessionInfo = Required<ISessionInfo>;
export const SessionContext = createContext<SessionInfo | null | undefined>(
  null,
);

interface Props {
  children: ReactNode
}

export function SessionProvider({ children }: Props) {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null | undefined>(null);
  const navigate = useNavigate();

  useEffect(() => {
    handleIncomingRedirect({ restorePreviousSession: true })
      .then((sessionInfo) => {
        if (sessionInfo && sessionInfo.isLoggedIn) {
          setSessionInfo(sessionInfo as SessionInfo)
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
      {children}
    </SessionContext.Provider>
  )
}