import { login } from "@inrupt/solid-client-authn-browser";
import { useState } from "react";

function SigninView() {
    const [provider, setProvider] = useState("http://localhost:3000")

    function loginWithProvider(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault()
        return login({
            oidcIssuer: provider,
            redirectUrl: new URL("/", window.location.href).toString(),
            clientName: "Solid Archiving"
        });
    }

    return (
        <div className="rounded-lg p-8 border-1 border-gray-900">
            <form onSubmit={loginWithProvider}>
                <label htmlFor="provider">Provider: </label>
                <input value={provider} placeholder="provider" onChange={e => setProvider(e.target.value)} />
                <button className="ml-2" type="submit">Continue</button>
            </form>
        </div>
    )
}

export default SigninView
