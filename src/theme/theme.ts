import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing, BorderRadius } from './spacing';

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  
  // Common styles
  styles: {
    container: {
      flex: 1,
      padding: Spacing.md,
    },
    
    card: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
    },
    
    button: {
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
    },
    
    input: {
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderWidth: 1,
    },
  },
};