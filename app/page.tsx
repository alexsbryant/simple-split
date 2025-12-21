import { CURRENT_USER, MOCK_USERS, MOCK_GROUP, INITIAL_EXPENSES } from '@/lib/mock-data'
import { SimpleSplitPage } from '@/components/split-page'

export default function Home() {
  return (
    <SimpleSplitPage
      currentUser={CURRENT_USER}
      group={MOCK_GROUP}
      users={MOCK_USERS}
      initialExpenses={INITIAL_EXPENSES}
    />
  )
}
