import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Layout from '@/layout'

import '../styles.css'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <>
            {/* <Outlet /> */}
            <Layout />
            <TanStackDevtools
                config={{
                    position: 'bottom-right',
                }}
                plugins={[
                    {
                        name: 'TanStack Router',
                        render: <TanStackRouterDevtoolsPanel />,
                    },
                ]}
            />
        </>
    )
}
