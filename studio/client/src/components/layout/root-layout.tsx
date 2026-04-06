import { Box, HStack } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export function RootLayout() {
  return (
    <HStack h="100vh" gap={0} align="stretch">
      <Sidebar />
      <Box flex={1} display="flex" flexDir="column" minW={0} overflow="hidden">
        <Outlet />
      </Box>
    </HStack>
  )
}
