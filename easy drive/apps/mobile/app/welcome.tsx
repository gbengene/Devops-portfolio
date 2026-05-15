/**
 * Welcome / Onboarding Screen
 *
 * Full-screen dark screen with branding, tagline, and two role-selection CTAs.
 * Design spec: DESIGN_SYSTEM.md Section 5 — Screen 1: Welcome / Onboarding
 *
 * No navbar. No tab bar. Stack navigator root.
 * Background uses a dark gradient (placeholder for a real hero photo).
 */
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, radius, spacing, typography } from '@easy-drive/theme'

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    // LinearGradient simulates the cinematic hero photo overlay for the scaffold.
    // Replace with ImageBackground + a real hero image for production.
    <LinearGradient
      colors={['#0A0A0A', '#050505', '#000000']}
      style={styles.gradient}
    >
      {/* Dark overlay — matches rgba(0,0,0,0.55) from design spec */}
      <View style={styles.overlay} />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {/* Wordmark */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            Easy<Text style={styles.logoAccent}>Drive</Text>
          </Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Your car. Their ride.{'\n'}Everyone wins.
        </Text>

        {/* CTA buttons */}
        <View style={styles.buttonContainer}>
          {/* Primary CTA — List your car (host flow) */}
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/')}
            accessibilityRole="button"
            accessibilityLabel="List your car — go to host dashboard"
          >
            <Text style={styles.btnPrimaryText}>List your car</Text>
          </Pressable>

          {/* Secondary CTA — Find a car (renter flow) */}
          <Pressable
            style={({ pressed }) => [styles.btnOutline, pressed && styles.btnPressed]}
            onPress={() => router.push('/(renter)/browse')}
            accessibilityRole="button"
            accessibilityLabel="Find a car — go to renter browse"
          >
            <Text style={styles.btnOutlineText}>Find a car</Text>
          </Pressable>
        </View>

        {/* Sign in link */}
        <View style={styles.signInRow}>
          <Text style={styles.signInPrompt}>Already have an account? </Text>
          <Pressable
            onPress={() => router.push('/login')}
            accessibilityRole="link"
            accessibilityLabel="Sign in to your account"
          >
            <Text style={styles.signInLink}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-end',
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text.onDark,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: colors.brand.accent,
  },
  tagline: {
    fontSize: typography.fontSize.bodyMd.mobile,
    color: colors.text.onDark,
    lineHeight: typography.fontSize.bodyMd.mobile * typography.lineHeight.relaxed,
    marginBottom: spacing['2xl'],
  },
  buttonContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  btnPrimary: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: colors.text.onAccent,
    fontSize: typography.fontSize.buttonLg.mobile,
    fontWeight: typography.fontWeight.bold,
  },
  btnOutline: {
    height: 52,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    color: colors.text.onDark,
    fontSize: typography.fontSize.buttonLg.mobile,
    fontWeight: typography.fontWeight.bold,
  },
  btnPressed: {
    opacity: 0.75,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPrompt: {
    fontSize: typography.fontSize.bodySm.mobile,
    color: colors.text.muted,
  },
  signInLink: {
    fontSize: typography.fontSize.bodySm.mobile,
    color: colors.brand.accent,
    fontWeight: typography.fontWeight.semiBold,
  },
})
