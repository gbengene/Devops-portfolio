/**
 * Renter Tab Navigator
 *
 * 4-tab bottom navigator for authenticated renters.
 * Design spec: DESIGN_SYSTEM.md Section 4 — Renter Tab Bar
 *
 * Tab bar spec:
 *   Background:    surface.mobileCard (#1C1C1E)
 *   Top border:    1px solid rgba(255,255,255,0.08)
 *   Active tint:   brand.accent (#00C2D4)
 *   Inactive tint: text.muted   (#94A3B8)
 *   Label font:    14px weight 600
 *   Icon size:     24px
 *   Height:        56px + device safe area inset (bottom)
 */
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography } from '@easy-drive/theme'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface TabConfig {
  name: string
  title: string
  icon: IoniconName
  iconActive: IoniconName
  accessibilityLabel: string
}

const RENTER_TABS: TabConfig[] = [
  {
    name: 'browse',
    title: 'Browse',
    icon: 'search-outline',
    iconActive: 'search',
    accessibilityLabel: 'Browse available vehicles',
  },
  {
    name: 'bookings',
    title: 'My Bookings',
    icon: 'document-text-outline',
    iconActive: 'document-text',
    accessibilityLabel: 'My active and past rentals',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
    accessibilityLabel: 'Account, documents, and payment',
  },
  {
    name: 'messages',
    title: 'Messages',
    icon: 'chatbubble-outline',
    iconActive: 'chatbubble',
    accessibilityLabel: 'Host-renter messages',
  },
]

export default function RenterTabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.accent,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface.mobileCard,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.label.mobile,
          fontWeight: typography.fontWeight.semiBold,
        },
      }}
    >
      {RENTER_TABS.map(({ name, title, icon, iconActive, accessibilityLabel }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: accessibilityLabel,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? iconActive : icon}
                size={24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
