/**
 * Host Dashboard — Placeholder Screen
 *
 * Design spec: DESIGN_SYSTEM.md Section 5 — Screen 4: Host Dashboard
 * Full implementation pending. This scaffold confirms routing and theming work.
 */
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@easy-drive/theme'

export default function HostDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Host portal — coming soon</Text>
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
