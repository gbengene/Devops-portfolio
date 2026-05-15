/**
 * Host Earnings — Placeholder Screen
 *
 * Design spec: DESIGN_SYSTEM.md Section 4 — Host Tab Bar (Earnings tab)
 * Full implementation pending. Scaffold confirms routing and theming work.
 */
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@easy-drive/theme'

export default function HostEarnings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings</Text>
      <Text style={styles.subtitle}>Payout history and schedule — coming soon</Text>
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
