import { Box, Text, VStack } from '@chakra-ui/react'
import { Settings } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export default function SettingsPage() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" h="full">
      <EmptyState
        icon={<Settings size={40} />}
        title="Settings"
        description="Configuration options coming soon."
      />
    </Box>
  )
}
