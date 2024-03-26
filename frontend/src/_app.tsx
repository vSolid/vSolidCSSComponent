import { SessionProvider } from './contexts/session'
import { Outlet } from 'react-router-dom';
import { SignoutButton } from './components/buttons/signout_button';
import FieldSet from './components/ui/FieldSet';

function App() {
    return (
        <SessionProvider>
            <Outlet />

            <FieldSet header="Account:">
                <SignoutButton />
            </FieldSet>
        </SessionProvider>
    )
}

export default App
