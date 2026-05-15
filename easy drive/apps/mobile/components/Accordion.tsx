/**
 * Accordion Component — FAQ-style expandable row
 *
 * The web uses <details>/<summary> HTML elements for the FAQ section.
 * React Native has no equivalent, so this component replicates the behaviour
 * using Pressable + useState with LayoutAnimation for the expand/collapse
 * transition — simpler and more performant than Animated.View for this use case.
 *
 * Android note: LayoutAnimation requires UIManager opt-in on Android (set below).
 *
 * Design spec: DESIGN_SYSTEM.md Section 6 — Component Behaviour Differences
 *   backgroundColor: surface.dark4 (#111111)
 *   borderRadius: radius.lg (12)
 *   border: border.dark rgba(255,255,255,0.10)
 */
import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native'
import { colors, radius, spacing, typography } from '@easy-drive/theme'

// LayoutAnimation requires this flag on Android API 16+
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

interface AccordionProps {
  /** The question / header text shown at all times */
  question: string
  /** The answer / body text shown when the accordion is open */
  answer: string
}

export function Accordion({ question, answer }: AccordionProps) {
  const [open, setOpen] = useState(false)

  function toggle() {
    // Schedule the animation frame before the state update so RN captures it
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen((prev) => !prev)
  }

  return (
    <Pressable
      onPress={toggle}
      style={styles.container}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={question}
    >
      <View style={styles.header}>
        <Text style={styles.question}>{question}</Text>
        {/* Chevron rotates 90deg when open — implemented via separate style rather
            than Animated.Value to keep this component dependency-free */}
        <Text style={[styles.chevron, open && styles.chevronOpen]}>›</Text>
      </View>

      {open && (
        <Text style={styles.answer}>{answer}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.mobileScreen,  // dark4 = #111111
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    color: colors.text.onDark,
    fontSize: typography.fontSize.bodySm.mobile,
    fontWeight: typography.fontWeight.semiBold,
    flex: 1,
    marginRight: spacing.sm,
  },
  chevron: {
    color: colors.text.muted,
    fontSize: 20,
    // Note: RN transform rotate uses a string value
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  answer: {
    color: colors.text.muted,
    fontSize: typography.fontSize.bodySm.mobile,
    lineHeight: typography.fontSize.bodySm.mobile * typography.lineHeight.relaxed,
    marginTop: spacing.md,
  },
})
