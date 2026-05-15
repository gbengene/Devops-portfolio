/**
 * Host Tab Navigator
 *
 * 4-tab bottom navigator for authenticated hosts.
 * Design spec: DESIGN_SYSTEM.md Section 4 — Host Tab Bar
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

const HOST_TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Dashboard',
    icon: 'home-outline',
    iconActive: 'home',
    accessibilityLabel: 'Host Dashboard',
  },
  {
    name: 'listings',
    title: 'Listings',
    icon: 'car-outline',
    iconActive: 'car',
    accessibilityLabel: 'My vehicle listings',
  },
  {
    name: 'bookings',
    title: 'Bookings',
    icon: 'calendar-outline',
    iconActive: 'calendar',
    accessibilityLabel: 'Incoming and active bookings',
  },
  {
    name: 'earnings',
    title: 'Earnings',
    icon: 'cash-outline',
    iconActive: 'cash',
    accessibilityLabel: 'Payout history and schedule',
  },
]

export default function HostTabLayout() {
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
      {HOST_TABS.map(({ name, title, icon, iconActive, accessibilityLabel }) => (
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
