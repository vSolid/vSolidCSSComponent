import { Outlet } from 'react-router-dom';
import { SignoutButton } from './components/buttons/signout_button';
import FieldSet from './components/ui/FieldSet';
import { ResourceProvider } from './contexts/resource';
import { SessionProvider } from './contexts/session';

function App() {
    return (
        <div className="lg:w-1/2 m-auto lg:my-8">
            <SessionProvider>
                <ResourceProvider>
                        <Outlet />

                        <FieldSet header="Account:">
                            <SignoutButton />
                        </FieldSet>
                </ResourceProvider>
            </SessionProvider>
        </div>
    )
}

export default App
