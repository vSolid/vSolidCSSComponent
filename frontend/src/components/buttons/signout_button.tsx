import { logout } from "@inrupt/solid-client-authn-browser";

export function SignoutButton() {
    return (
        <button onClick={() => logout({ logoutType: 'app' })}>Sign out</button>
    )
}