/**
 * Host Listings — Placeholder Screen
 *
 * Design spec: DESIGN_SYSTEM.md Section 4 — Host Tab Bar (Listings tab)
 * Full implementation pending. Scaffold confirms routing and theming work.
 */
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@easy-drive/theme'

export default function HostListings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Listings</Text>
      <Text style={styles.subtitle}>Vehicle listing management — coming soon</Text>
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
