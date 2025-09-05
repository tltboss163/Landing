import { Global, MantineTheme } from '@mantine/core';

export function GlobalStyles() {
  return (
    <Global
      styles={(theme: MantineTheme) => ({
        body: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.other.background : theme.other.background,
          color: theme.colorScheme === 'dark' ? theme.other.onBackground : theme.other.onBackground,
        },
      })}
    />
  );
}
