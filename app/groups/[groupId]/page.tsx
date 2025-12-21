import { CURRENT_USER, MOCK_USERS, MOCK_GROUP, INITIAL_EXPENSES } from '@/lib/mock-data'
import { SimpleSplitPage } from '@/components/split-page'

export default function GroupPage({ params }: { params: { groupId: string } }) {
  // For now, ignore params.groupId and use mock data
  // Later: fetch group data based on params.groupId
  return (
    <SimpleSplitPage
      currentUser={CURRENT_USER}
      group={MOCK_GROUP}
      users={MOCK_USERS}
      initialExpenses={INITIAL_EXPENSES}
    />
  )
}
