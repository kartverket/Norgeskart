import { Grid, GridItem } from '@kvib/react';
import { useState } from 'react';
import { MapComponent } from '../map/MapComponent';
import { SideNavigation } from './SideNavigation';

export const DesktopLayout = () => {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <Grid
            height="100dvh"
            width="100%"
            gridTemplateColumns={
                isMinimized
                    ? '50px minmax(0, 1fr)'
                    : '94px minmax(0, 1fr)'
            }
            gridTemplateRows="minmax(0, 1fr)"
            overflow="hidden"
            bg="gray.200"
        >
            <GridItem>
                <SideNavigation
                    isMinimized={isMinimized}
                    onToggleMinimized={() => setIsMinimized(!isMinimized)}
                />
            </GridItem>

            <GridItem minWidth={0} minHeight={0}>
                <MapComponent />
            </GridItem>
        </Grid>
    );
};