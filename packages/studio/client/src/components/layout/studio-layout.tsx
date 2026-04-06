import { Box, HStack } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { NavRail } from './nav-rail'

export function StudioLayout() {
  return (
    <HStack h="100vh" gap={0} align="stretch">
      <NavRail />
      <Box flex={1} display="flex" flexDir="column" minW={0} overflow="hidden">
        <Outlet />
      </Box>
    </HStack>
  )
}
