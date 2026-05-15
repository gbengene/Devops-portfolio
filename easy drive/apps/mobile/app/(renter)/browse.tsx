/**
 * Renter Browse — Placeholder Screen
 *
 * Design spec: DESIGN_SYSTEM.md Section 5 — Screen 2: Renter Browse (Vehicle Listing)
 * Full implementation pending. Scaffold confirms routing and theming work.
 */
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@easy-drive/theme'

export default function RenterBrowse() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find your car</Text>
      <Text style={styles.subtitle}>Vehicle search and filter — coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.mobileScreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.text.onDark,
    fontSize: typography.fontSize.h2.mobile,
    fontWeight: typography.fontWeight.extraBold,
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: typography.fontSize.bodySm.mobile,
    marginTop: spacing.sm,
  },
})
